"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = void 0;
const supabase_1 = require("../config/supabase");
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Fetch hospital details
        const { data: hospital, error: hospitalError } = await supabase_1.supabase
            .from('hospitals')
            .select('*')
            .eq('id', req.user.hospital_id)
            .single();
        if (hospitalError)
            throw hospitalError;
        res.status(200).json({
            user: req.user,
            hospital
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMe = getMe;
