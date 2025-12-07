import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Log JWT secret status (only first few chars for security)
console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? `${JWT_SECRET.substring(0, 5)}...` : 'NOT SET');

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
  console.log('🎫 Generating token with secret:', JWT_SECRET ? `${JWT_SECRET.substring(0, 5)}...` : 'NOT SET');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    console.log('🔍 Verifying token...');
    console.log('🔍 Token (first 20 chars):', token.substring(0, 20));
    console.log('🔍 JWT_SECRET exists:', !!JWT_SECRET);
    console.log('🔍 JWT_SECRET (first 5 chars):', JWT_SECRET ? JWT_SECRET.substring(0, 5) : 'NOT SET');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully:', {
      id: (decoded as any).id,
      userType: (decoded as any).userType,
      email: (decoded as any).email
    });
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed');
    console.error('Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && 'name' in error) {
      console.error('Error name:', (error as any).name);
    }
    throw new Error('Invalid token');
  }
}

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
  await prisma.audit_logs.create({
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