import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, authenticateUser, hasRole } from '@/middleware/auth';

// Mock utilities
function generateInviteToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function validateEmailDomain(email: string, allowedDomain: string): boolean {
  const emailDomain = email.split('@')[1];
  return emailDomain === allowedDomain;
}

async function sendInviteEmail(email: string, token: string, universityName: string) {
  console.log(`📧 University Admin invite sent to ${email} for ${universityName} with token: ${token}`);
  // In production, integrate with email service
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createApiResponse(false, 'Authentication required', null, 401);
    }

    // Check if user is SuperAdmin
    if (!hasRole(user, 'SuperAdmin')) {
      return createApiResponse(false, 'Only SuperAdmin can invite university admins', null, 403);
    }

    const body = await request.json();
    const { email } = body;
    const universityId = params.id;

    // Validate required fields
    if (!email) {
      return createApiResponse(false, 'Email is required', null, 400);
    }

    // Get university
    const university = await prisma.universities.findUnique({
      where: { universityId },
    });

    if (!university) {
      return createApiResponse(false, 'University not found', null, 404);
    }

    // Validate email domain matches university domain
    if (university.officialDomain && !validateEmailDomain(email, university.officialDomain)) {
      return createApiResponse(
        false,
        `Email domain must match university domain: ${university.officialDomain}`,
        null,
        400
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createApiResponse(false, 'User with this email already exists', null, 400);
    }

    // Get UniversityAdmin role
    const role = await prisma.role.findUnique({
      where: { name: 'UniversityAdmin' },
    });

    if (!role) {
      return createApiResponse(false, 'UniversityAdmin role not found', null, 500);
    }

    // Generate invite token
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        email,
        roleId: role.roleId,
        universityId,
        token,
        createdBy: user.userId,
        expiresAt,
      },
    });

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        actorUser: user.userId,
        action: 'UNIVERSITY_ADMIN_INVITED',
        objectType: 'INVITE',
        objectId: invite.inviteId,
        detail: {
          email,
          universityName: university.name,
          universityId,
        },
      },
    });

    // Send invite email
    await sendInviteEmail(email, token, university.name);

    return createApiResponse(
      true,
      'University admin invite sent successfully',
      {
        inviteId: invite.inviteId,
        email: invite.email,
        expiresAt: invite.expiresAt,
      }
    );

  } catch (error) {
    console.error('Invite university admin error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}