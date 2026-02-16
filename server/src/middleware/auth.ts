import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getSecret } from '../utils/crypto.js';

dotenv.config();

const JWT_SECRET = getSecret('JWT_SECRET');

export interface AuthenticatedUser {
    id: string;
    username: string;
    role: string;
    status: string;
}

export interface AuthRequest extends Request {
    user?: AuthenticatedUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
        return;
    }
}

export function generateToken(user: { id: string; username: string; role: string; status: string }): string {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role, status: user.status },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}
