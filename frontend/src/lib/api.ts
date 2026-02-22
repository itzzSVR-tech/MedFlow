import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api',
});

let accessToken: string | null = null;

// Keep token in sync without hitting LockManager on every request
supabase.auth.onAuthStateChange((_event, session) => {
    accessToken = session?.access_token || null;
});

// Initial token fetch
supabase.auth.getSession().then(({ data: { session } }) => {
    accessToken = session?.access_token || null;
});

// Add a request interceptor to attach the Supabase JWT
api.interceptors.request.use(async (config) => {
    // Use the cached token if available, fallback to a single getSession if not
    const token = accessToken || (await supabase.auth.getSession()).data.session?.access_token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;

        // Pass intended role for first-time login (Google OAuth)
        const intendedRole = typeof window !== "undefined" ? localStorage.getItem("medflow_intended_role") : null;
        if (intendedRole) {
            config.headers["X-Medflow-Role"] = intendedRole;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
