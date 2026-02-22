import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { OnboardingService } from '../services/onboarding.service';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        supabase_uid: string;
        role: 'admin' | 'doctor' | 'patient';
        hospital_id: string;
        email?: string;
    };
}

// ─── In-memory token cache ────────────────────────────────────────────────────
// Caches the resolved internal user for each bearer token for up to 60 seconds.
// This eliminates 2 Supabase round trips (auth.getUser + DB lookup) on every request.
interface CacheEntry {
    user: NonNullable<AuthRequest['user']>;
    supabaseUser: any;
    expiresAt: number;
}

const TOKEN_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 60 seconds

// Prune stale entries every 5 minutes so the map doesn't grow forever
setInterval(() => {
    const now = Date.now();
    TOKEN_CACHE.forEach((entry, token) => {
        if (entry.expiresAt < now) TOKEN_CACHE.delete(token);
    });
}, 5 * 60_000);

// ─── Middleware ───────────────────────────────────────────────────────────────
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Fast path: cache hit
    const cached = TOKEN_CACHE.get(token);
    if (cached && cached.expiresAt > Date.now()) {
        req.user = cached.user;
        (req as any).supabaseUser = cached.supabaseUser;
        return next();
    }

    try {
        // Slow path: verify JWT + ensure user profile in parallel where possible
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !supabaseUser) {
            console.error('Supabase auth error:', authError);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Ensure internal user record exists (auto-onboarding)
        const roleOverride = req.headers['x-medflow-role'] as string;
        const user = await OnboardingService.ensureUser(supabaseUser, roleOverride);

        // Populate cache
        TOKEN_CACHE.set(token, {
            user,
            supabaseUser,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });

        req.user = user;
        (req as any).supabaseUser = supabaseUser;
        next();
    } catch (err: any) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ message: 'Internal Server Error during Authentication', details: err.message });
    }
};

// ─── Cache invalidation ───────────────────────────────────────────────────────
// Call this after any operation that changes a user's role/status so the next
// request picks up fresh data (e.g. after admin suspends a user).
export const invalidateAuthCache = (token?: string) => {
    if (token) {
        TOKEN_CACHE.delete(token);
    } else {
        TOKEN_CACHE.clear();
    }
};
