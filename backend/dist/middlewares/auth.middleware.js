"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const firebase_1 = require("../config/firebase");
const supabase_1 = require("../config/supabase");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        // 1. Verify Firebase ID Token
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        const firebase_uid = decodedToken.uid;
        // 2. Fetch internal user from Supabase
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .single();
        if (error || !user) {
            console.error('User mapping error:', error);
            return res.status(403).json({ message: 'User not registered in internal database' });
        }
        // 3. Attach user to request
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.authMiddleware = authMiddleware;
