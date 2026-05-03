import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password utility
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token (uncached version for internal use)
function verifyTokenInternal(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Invalid token');
  }
}

// Cached version of verifyToken - prevents duplicate token verification in a single render pass
export const verifyToken = cache((token: string): any => {
  return verifyTokenInternal(token);
});

// Generate secure invite token
export function generateInviteToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Domain verification utility
export function validateEmailDomain(email: string, allowedDomain: string): boolean {
  const emailDomain = email.split('@')[1];
  return emailDomain === allowedDomain;
}

// Audit log utility
export async function logAuditEvent(
  prisma: PrismaClient,
  actorUserId: string | null,
  action: string,
  objectType?: string,
  objectId?: string,
  detail?: any
) {
  await prisma.auditLog.create({
    data: {
      actorUser: actorUserId,
      action,
      objectType,
      objectId,
      detail,
    },
  });
}

// API Response utility
export function createResponse(success: boolean, message: string, data?: any) {
  return {
    success,
    message,
    ...(data && { data }),
  };
}