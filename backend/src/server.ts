import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middlewares/auth.middleware';
import adminRoutes from './routes/admin.routes';
import doctorRoutes from './routes/doctor.routes';
import patientRoutes from './routes/patient.routes';
import * as AuthController from './controllers/auth.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002'
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Profile route
app.get('/api/auth/me', authMiddleware, AuthController.getMe);

// Protected API Routes
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/doctor', authMiddleware, doctorRoutes);
app.use('/api/patient', authMiddleware, patientRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 MedFlow Backend running on port ${PORT}`);
});

// Graceful shutdown — ensures the port is freed on process exit
const shutdown = (signal: string) => {
    console.log(`\n[${signal}] Shutting down server...`);
    server.close(() => {
        console.log('Server closed. Port released.');
        process.exit(0);
    });
    // Force exit after 3 seconds if server doesn't close
    setTimeout(() => process.exit(1), 3000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
