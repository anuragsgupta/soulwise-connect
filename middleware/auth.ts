import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define user context for authenticated requests
export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: Array<{
    roleId: string;
    roleName: string;
    universityId?: string;
    instituteId?: string;
  }>;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

// Mock JWT verification for now (replace with actual implementation)
function verifyJWT(token: string): { userId: string } | null {
  try {
    // In production, use actual JWT verification
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // For now, we'll extract userId from a simple token format
    if (token.startsWith('user-')) {
      return { userId: token.replace('user-', '') };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const tokenPayload = verifyJWT(token);
  
  if (!tokenPayload) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId: tokenPayload.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    const authenticatedUser: AuthenticatedUser = {
      userId: user.userId,
      email: user.email,
      roles: user.userRoles.map(ur => ({
        roleId: ur.roleId,
        roleName: ur.role.name,
        universityId: ur.universityId || undefined,
        instituteId: ur.instituteId || undefined,
      })),
    };

    return authenticatedUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Role-based authorization
export function hasRole(user: AuthenticatedUser, roleName: string): boolean {
  return user.roles.some(role => role.roleName === roleName);
}

export function hasUniversityAccess(user: AuthenticatedUser, universityId: string): boolean {
  return user.roles.some(role => 
    role.roleName === 'SuperAdmin' || role.universityId === universityId
  );
}

export function hasInstituteAccess(user: AuthenticatedUser, instituteId: string): boolean {
  return user.roles.some(role => 
    role.roleName === 'SuperAdmin' || 
    role.instituteId === instituteId ||
    (role.roleName === 'UniversityAdmin' && role.universityId)
  );
}

// Middleware factory for protecting routes
export function requireAuth(requiredRole?: string, universityAccess?: boolean, instituteAccess?: boolean) {
  return async function middleware(
    request: NextRequest,
    handler: (req: NextRequest & { user: AuthenticatedUser }) => Promise<NextResponse>
  ) {
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check role requirement
    if (requiredRole && !hasRole(user, requiredRole)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Attach user to request
    (request as any).user = user;
    
    return await handler(request as NextRequest & { user: AuthenticatedUser });
  };
}

// Utility for API responses
export function createApiResponse(success: boolean, message: string, data?: any, status = 200) {
  return NextResponse.json(
    {
      success,
      message,
      ...(data && { data }),
    },
    { status }
  );
}