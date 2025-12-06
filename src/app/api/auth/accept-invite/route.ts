import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse } from '@/middleware/auth';

// Mock password hashing (replace with bcrypt)
async function hashPassword(password: string): Promise<string> {
  // In production: return await bcrypt.hash(password, 12);
  return `hashed-${password}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, displayName } = body;

    // Validate required fields
    if (!token || !password || !displayName) {
      return createApiResponse(false, 'Token, password, and display name are required', null, 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return createApiResponse(false, 'Password must be at least 8 characters long', null, 400);
    }

    // Find valid invite
    const invite = await prisma.invite.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        acceptedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (!invite) {
      return createApiResponse(false, 'Invalid or expired invite token', null, 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      return createApiResponse(false, 'User with this email already exists', null, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invite.email,
        passwordHash,
        displayName,
        status: 'pending', // Pending approval from admin
      },
    });

    // Create user role assignment
    await prisma.userRole.create({
      data: {
        userId: user.userId,
        roleId: invite.roleId,
        university_id: invite.universityId,
        institute_id: invite.instituteId,
        grantedBy: invite.createdBy,
      },
    });

    // Mark invite as accepted
    await prisma.invite.update({
      where: { inviteId: invite.inviteId },
      data: { acceptedAt: new Date() },
    });

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        actorUser: user.userId,
        action: 'INVITE_ACCEPTED',
        objectType: 'USER',
        objectId: user.userId,
        detail: {
          email: user.email,
          role: invite.role.name,
          university_id: invite.universityId,
          institute_id: invite.instituteId,
        },
      },
    });

    return createApiResponse(
      true,
      'Account created successfully. Your account is pending approval from an administrator.',
      {
        userId: user.userId,
        email: user.email,
        status: user.status,
        role: invite.role.name,
      }
    );

  } catch (error) {
    console.error('Accept invite error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}