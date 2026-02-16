import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required.' });
        return;
    }

    next();
}

export function requireApproved(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
    }

    if (req.user.role !== 'admin' && req.user.status === 'disabled') {
        res.status(403).json({ error: 'Your account has been disabled. Please contact support.' });
        return;
    }

    if (req.user.role !== 'admin' && req.user.status !== 'approved') {
        res.status(403).json({ error: 'Account not approved yet.' });
        return;
    }

    next();
}

