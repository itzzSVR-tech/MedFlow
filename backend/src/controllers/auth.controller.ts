import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const dbUser = req.user;
        const supabaseUser = (req as any).supabaseUser;

        if (!dbUser) {
            return res.status(401).json({ message: 'User profile not found' });
        }

        // 1. Get hospital details
        const { data: hospital, error: hospitalError } = await supabase
            .from('hospitals')
            .select('*')
            .eq('id', dbUser.hospital_id)
            .maybeSingle();

        if (hospitalError) throw hospitalError;

        // 2. If doctor, fetch doctor profile details
        let doctorProfile = null;
        if (dbUser.role === 'doctor') {
            const { data: docData } = await supabase
                .from('doctors')
                .select('*')
                .eq('user_id', dbUser.id)
                .maybeSingle();
            doctorProfile = docData;
        }

        res.status(200).json({
            user: {
                ...dbUser,
                doctorProfile
            },
            hospital
        });
    } catch (error: any) {
        console.error('getMe error:', error);
        res.status(500).json({ message: error.message });
    }
};
