import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const hospitalMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.hospital_id) {
        return res.status(403).json({ message: 'Hospital association missing' });
    }

    // Every query in the service layer MUST use req.user.hospital_id
    next();
};
