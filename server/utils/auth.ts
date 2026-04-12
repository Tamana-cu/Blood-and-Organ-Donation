import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): DecodedToken | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.verify(token, secret) as DecodedToken;
  } catch {
    return null;
  }
}

// Middleware to verify authentication
export async function authMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
  }
}

// Middleware to check if user is admin
export function adminMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
}
