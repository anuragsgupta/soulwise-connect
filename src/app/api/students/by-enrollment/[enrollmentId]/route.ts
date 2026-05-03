import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, authenticateUser, hasInstituteAccess, hasRole } from '@/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createApiResponse(false, 'Authentication required', null, 401);
    }

    const { enrollmentId } = params;

    // Find student
    const student = await prisma.student.findUnique({
      where: { enrollmentId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            displayName: true,
            status: true,
          },
        },
        institute: {
          include: {
            university: {
              select: {
                universityId: true,
                name: true,
                officialDomain: true,
              },
            },
          },
        },
        records: {
          orderBy: { updatedAt: 'desc' },
          take: 5, // Latest 5 records
        },
      },
    });

    if (!student) {
      return createApiResponse(false, 'Student not found', null, 404);
    }

    // Check authorization
    const isAuthorized = 
      hasRole(user, 'SuperAdmin') ||
      hasInstituteAccess(user, student.instituteId) ||
      (student.user && student.user.userId === user.userId); // Student accessing their own profile

    if (!isAuthorized) {
      return createApiResponse(false, 'Insufficient permissions to view this student', null, 403);
    }

    // Prepare response data
    const studentProfile = {
      studentId: student.studentId,
      enrollmentId: student.enrollmentId,
      name: student.name,
      dob: student.dob,
      program: student.program,
      branch: student.branch,
      yearOfAdmission: student.yearOfAdmission,
      email: student.email,
      phone: student.phone,
      institute: {
        instituteId: student.institute.instituteId,
        name: student.institute.name,
        code: student.institute.code,
        university: {
          universityId: student.institute.university.universityId,
          name: student.institute.university.name,
          officialDomain: student.institute.university.officialDomain,
        },
      },
      user: student.user ? {
        userId: student.user.userId,
        email: student.user.email,
        displayName: student.user.displayName,
        status: student.user.status,
      } : null,
      recentRecords: student.records.map(record => ({
        recordId: record.recordId,
        academicYear: record.academicYear,
        semester: record.semester,
        cgpa: record.cgpa,
        attendancePct: record.attendancePct,
        supportServices: record.supportServices,
        updatedAt: record.updatedAt,
      })),
      meta: student.meta,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    // Log audit event (for sensitive data access)
    await prisma.auditLog.create({
      data: {
        actorUser: user.userId,
        action: 'STUDENT_PROFILE_ACCESSED',
        objectType: 'STUDENT',
        objectId: student.studentId,
        detail: {
          enrollmentId: student.enrollmentId,
          studentName: student.name,
          accessedBy: user.email,
          instituteName: student.institute.name,
        },
      },
    });

    return createApiResponse(
      true,
      'Student profile retrieved successfully',
      { student: studentProfile }
    );

  } catch (error) {
    console.error('Get student by enrollment error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}