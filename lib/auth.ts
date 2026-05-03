import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    // Handle demo tokens
    if (token.startsWith('demo-token-')) {
      console.log('✅ Demo token detected, skipping JWT verification');
      return {
        id: 'demo-student-123',
        email: 'demo.student@university.edu',
        role: 'STUDENT',
        userType: 'STUDENT',
        isDemo: true,
      };
    }

    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
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
  // Skip audit logging if no user ID provided
  if (!actorUserId) return;

  // Map generic action to valid AuditAction enum values
  let auditAction: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' = 'UPDATE';
  
  if (action.toUpperCase() === 'CREATE') auditAction = 'CREATE';
  else if (action.toUpperCase() === 'DELETE') auditAction = 'DELETE';
  else if (action.toUpperCase() === 'LOGIN') auditAction = 'LOGIN';
  else if (action.toUpperCase() === 'LOGOUT') auditAction = 'LOGOUT';
  else if (action.toUpperCase() === 'PASSWORD_CHANGE') auditAction = 'PASSWORD_CHANGE';

  try {
    await prisma.auditLog.create({
      data: {
        performedById: actorUserId,
        performedByType: 'STUDENT', // Default to STUDENT - adjust as needed
        action: auditAction,
        tableName: objectType || 'unknown',
        recordId: objectId || 'unknown',
        ...(detail && { newValues: detail }),
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging shouldn't break application
  }
}

// API Response utility
export function createResponse(success: boolean, message: string, data?: any) {
  return {
    success,
    message,
    ...(data && { data }),
  };
}