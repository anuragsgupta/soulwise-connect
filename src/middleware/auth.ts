import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Define user context for authenticated requests
export interface AuthenticatedUser {
  userId: string;
  email: string;
  userType: 'STUDENT' | 'FACULTY' | 'ADMIN';
  roles?: Array<{
    roleId: string;
    roleName: string;
    universityId?: string;
    instituteId?: string;
  }>;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

// Authentication middleware
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format');
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token) as any;
    
    if (!decoded || (!decoded.userId && !decoded.id) || !decoded.userType) {
      console.log('Invalid token payload:', decoded);
      return null;
    }

    return {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      roles: decoded.roles,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Role-based authorization
export function hasRole(user: AuthenticatedUser, roleName: string): boolean {
  return user.roles?.some(role => role.roleName === roleName) || false;
}

export function hasUniversityAccess(user: AuthenticatedUser, universityId: string): boolean {
  return user.roles?.some(role => 
    role.roleName === 'SuperAdmin' || role.universityId === universityId
  ) || false;
}

export function hasInstituteAccess(user: AuthenticatedUser, instituteId: string): boolean {
  return user.roles?.some(role => 
    role.roleName === 'SuperAdmin' || 
    role.instituteId === instituteId ||
    (role.roleName === 'UniversityAdmin' && role.universityId)
  ) || false;
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

// Get user from token stored in localStorage (client-side approach)
export async function getUserFromRequest(request: NextRequest): Promise<any | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Decode the token to get user info
    // In production, verify JWT signature
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload;
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Authorization helpers for specific resources
export async function canModifyUniversity(userId: string, universityId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can modify any university
    if (admin.isSuperAdmin) return true;

    // UniversityAdmin can only modify their own university
    if (admin.adminType === 'UNIVERSITY_ADMIN' && admin.universityId === universityId) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking university modification permissions:', error);
    return false;
  }
}

export async function canDeleteUniversity(userId: string, universityId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // Only SuperAdmin can delete universities
    // UniversityAdmins cannot delete their own university
    return admin.isSuperAdmin === true;
  } catch (error) {
    console.error('Error checking university deletion permissions:', error);
    return false;
  }
}

export async function canModifyInstitute(userId: string, instituteId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can modify any institute
    if (admin.isSuperAdmin) return true;

    // Get the institute to check its university
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: { universityId: true },
    });

    if (!institute) return false;

    // UniversityAdmin can modify institutes under their university
    if (admin.adminType === 'UNIVERSITY_ADMIN' && admin.universityId === institute.universityId) {
      return true;
    }

    // InstituteAdmin can modify their own institute
    if (admin.adminType === 'INSTITUTE_ADMIN' && admin.instituteId === instituteId) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking institute modification permissions:', error);
    return false;
  }
}

export async function canDeleteInstitute(userId: string, instituteId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can delete any institute
    if (admin.isSuperAdmin) return true;

    // Get the institute to check its university
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: { universityId: true },
    });

    if (!institute) return false;

    // UniversityAdmin can delete institutes under their university
    if (admin.adminType === 'UNIVERSITY_ADMIN' && admin.universityId === institute.universityId) {
      return true;
    }

    // InstituteAdmins cannot delete institutes
    return false;
  } catch (error) {
    console.error('Error checking institute deletion permissions:', error);
    return false;
  }
}

export async function canModifyAdmin(userId: string, targetAdminId: string): Promise<boolean> {
  try {
    const requestingAdmin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!requestingAdmin) return false;

    // SuperAdmin can modify any admin
    if (requestingAdmin.isSuperAdmin) return true;

    const targetAdmin = await prisma.admin.findUnique({
      where: { id: targetAdminId },
      include: {
        institute: {
          select: { universityId: true },
        },
      },
    });

    if (!targetAdmin) return false;

    // Cannot modify SuperAdmins
    if (targetAdmin.isSuperAdmin) return false;

    // UniversityAdmin can modify admins in their university
    if (requestingAdmin.adminType === 'UNIVERSITY_ADMIN') {
      // Can modify other UniversityAdmins in the same university
      if (targetAdmin.adminType === 'UNIVERSITY_ADMIN' && 
          targetAdmin.universityId === requestingAdmin.universityId) {
        return true;
      }
      // Can modify InstituteAdmins in institutes under their university
      if (targetAdmin.adminType === 'INSTITUTE_ADMIN' && 
          targetAdmin.institute?.universityId === requestingAdmin.universityId) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking admin modification permissions:', error);
    return false;
  }
}

// Check if user can modify a faculty member
export async function canModifyFaculty(userId: string, facultyId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can modify any faculty
    if (admin.isSuperAdmin) return true;

    // Get the faculty to check their institute
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        department: {
          select: { instituteId: true },
        },
      },
    });

    if (!faculty) return false;

    // InstituteAdmin can modify faculty in their institute
    if (admin.adminType === 'INSTITUTE_ADMIN' && admin.instituteId === faculty.department.instituteId) {
      return true;
    }

    // UniversityAdmin can modify faculty in institutes under their university
    if (admin.adminType === 'UNIVERSITY_ADMIN') {
      const institute = await prisma.institute.findUnique({
        where: { id: faculty.department.instituteId },
        select: { universityId: true },
      });
      return institute?.universityId === admin.universityId;
    }

    return false;
  } catch (error) {
    console.error('Error checking faculty modification permissions:', error);
    return false;
  }
}

// Check if user can modify a student
export async function canModifyStudent(userId: string, studentId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can modify any student
    if (admin.isSuperAdmin) return true;

    // Get the student to check their institute
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: {
          include: {
            department: {
              select: { instituteId: true },
            },
          },
        },
      },
    });

    if (!student) return false;

    const instituteId = student.batch.department.instituteId;

    // InstituteAdmin can modify students in their institute
    if (admin.adminType === 'INSTITUTE_ADMIN' && admin.instituteId === instituteId) {
      return true;
    }

    // UniversityAdmin can modify students in institutes under their university
    if (admin.adminType === 'UNIVERSITY_ADMIN') {
      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        select: { universityId: true },
      });
      return institute?.universityId === admin.universityId;
    }

    return false;
  } catch (error) {
    console.error('Error checking student modification permissions:', error);
    return false;
  }
}

// Check if user can modify a department
export async function canModifyDepartment(userId: string, departmentId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can modify any department
    if (admin.isSuperAdmin) return true;

    // Get the department to check its institute
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { instituteId: true },
    });

    if (!department) return false;

    // InstituteAdmin can modify departments in their institute
    if (admin.adminType === 'INSTITUTE_ADMIN' && admin.instituteId === department.instituteId) {
      return true;
    }

    // UniversityAdmin can modify departments in institutes under their university
    if (admin.adminType === 'UNIVERSITY_ADMIN') {
      const institute = await prisma.institute.findUnique({
        where: { id: department.instituteId },
        select: { universityId: true },
      });
      return institute?.universityId === admin.universityId;
    }

    return false;
  } catch (error) {
    console.error('Error checking department modification permissions:', error);
    return false;
  }
}

// Check if user can modify a batch
export async function canModifyBatch(userId: string, batchId: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) return false;

    // SuperAdmin can modify any batch
    if (admin.isSuperAdmin) return true;

    // Get the batch to check its institute
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        department: {
          select: { instituteId: true },
        },
      },
    });

    if (!batch) return false;

    const instituteId = batch.department.instituteId;

    // InstituteAdmin can modify batches in their institute
    if (admin.adminType === 'INSTITUTE_ADMIN' && admin.instituteId === instituteId) {
      return true;
    }

    // UniversityAdmin can modify batches in institutes under their university
    if (admin.adminType === 'UNIVERSITY_ADMIN') {
      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        select: { universityId: true },
      });
      return institute?.universityId === admin.universityId;
    }

    return false;
  } catch (error) {
    console.error('Error checking batch modification permissions:', error);
    return false;
  }
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