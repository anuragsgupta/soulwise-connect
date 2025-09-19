import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse } from '@/middleware/auth';

// Mock password verification (replace with bcrypt)
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // In production: return await bcrypt.compare(password, hashedPassword);
  return `hashed-${password}` === hashedPassword;
}

// Mock JWT generation (replace with actual JWT)
function generateToken(payload: any): string {
  // In production: return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return `user-${payload.userId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, enrollmentId } = body;

    // Validate required fields
    if ((!email && !enrollmentId) || !password) {
      return createApiResponse(false, 'Email/Enrollment ID and password are required', null, 400);
    }

    let user;

    // Handle student login with enrollment ID
    if (enrollmentId) {
      const student = await prisma.student.findUnique({
        where: { enrollmentId },
        include: {
          user: {
            include: {
              userRoles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!student || !student.user) {
        return createApiResponse(false, 'Invalid enrollment ID or password', null, 401);
      }

      user = student.user;
    } else {
      // Handle regular email login
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        return createApiResponse(false, 'Invalid email or password', null, 401);
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return createApiResponse(false, 'Invalid email or password', null, 401);
    }

    // Check user status
    if (user.status === 'suspended') {
      return createApiResponse(false, 'Account is suspended. Please contact administrator.', null, 403);
    }

    if (user.status === 'pending') {
      return createApiResponse(false, 'Account is pending approval. Please contact administrator.', null, 403);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      roles: user.userRoles.map((ur: { roleId: any; role: { name: any; }; universityId: any; instituteId: any; }) => ({
        roleId: ur.roleId,
        roleName: ur.role.name,
        universityId: ur.universityId,
        instituteId: ur.instituteId,
      })),
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actorUser: user.userId,
        action: 'USER_LOGIN',
        objectType: 'USER',
        objectId: user.userId,
        detail: {
          email: user.email,
          loginMethod: enrollmentId ? 'enrollment_id' : 'email',
        },
      },
    });

    return createApiResponse(
      true,
      'Login successful',
      {
        token,
        user: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          status: user.status,
          roles: user.userRoles.map((ur: { role: { name: any; }; universityId: any; instituteId: any; }) => ({
            roleName: ur.role.name,
            universityId: ur.universityId,
            instituteId: ur.instituteId,
          })),
        },
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}