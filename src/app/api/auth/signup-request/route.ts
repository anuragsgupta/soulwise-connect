import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse } from '@/middleware/auth';

// Mock utilities (replace with actual implementations)
function generateInviteToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function validateEmailDomain(email: string, allowedDomain: string): boolean {
  const emailDomain = email.split('@')[1];
  return emailDomain === allowedDomain;
}

// Simulate sending invite email
async function sendInviteEmail(email: string, token: string, roleName: string) {
  console.log(`📧 Invite email sent to ${email} for role ${roleName} with token: ${token}`);
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, requestedRole, universityId, instituteId } = body;

    // Validate required fields
    if (!email || !requestedRole) {
      return createApiResponse(false, 'Email and requested role are required', null, 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createApiResponse(false, 'User with this email already exists', null, 400);
    }

    // Get role information
    const role = await prisma.role.findUnique({
      where: { name: requestedRole },
    });

    if (!role) {
      return createApiResponse(false, 'Invalid role specified', null, 400);
    }

    // Domain verification for UniversityAdmin
    if (requestedRole === 'UniversityAdmin' && universityId) {
      const university = await prisma.university.findUnique({
        where: { universityId },
      });

      if (!university) {
        return createApiResponse(false, 'University not found', null, 404);
      }

      if (university.officialDomain && !validateEmailDomain(email, university.officialDomain)) {
        return createApiResponse(
          false, 
          `Email domain must match university domain: ${university.officialDomain}`, 
          null, 
          400
        );
      }
    }

    // Create invite token
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours from now

    // Create invite record
    const invite = await prisma.invite.create({
      data: {
        email,
        roleId: role.roleId,
        universityId,
        instituteId,
        token,
        createdBy: 'system', // In production, use actual admin user ID
        expiresAt,
      },
    });

    // Send invite email
    await sendInviteEmail(email, token, requestedRole);

    return createApiResponse(
      true,
      'Invite sent successfully. Please check your email for the invitation link.',
      {
        inviteId: invite.inviteId,
        expiresAt: invite.expiresAt,
      }
    );

  } catch (error) {
    console.error('Signup request error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}