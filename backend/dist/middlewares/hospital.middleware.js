"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hospitalMiddleware = void 0;
const hospitalMiddleware = (req, res, next) => {
    if (!req.user || !req.user.hospital_id) {
        return res.status(403).json({ message: 'Hospital association missing' });
    }
    // Every query in the service layer MUST use req.user.hospital_id
    next();
};
exports.hospitalMiddleware = hospitalMiddleware;
