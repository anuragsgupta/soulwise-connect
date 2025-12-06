import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, authenticateUser, hasInstituteAccess } from '@/middleware/auth';

// Mock CSV parser (replace with actual CSV parsing library)
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Validate student data
function validateStudentData(student: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!student.enrollment_id) {
    errors.push('Enrollment ID is required');
  }
  
  if (!student.name) {
    errors.push('Name is required');
  }
  
  if (student.dob && !/^\d{4}-\d{2}-\d{2}$/.test(student.dob)) {
    errors.push('Date of birth must be in YYYY-MM-DD format');
  }
  
  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
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

    const instituteId = params.id;

    // Check if user has access to this institute
    if (!hasInstituteAccess(user, instituteId)) {
      return createApiResponse(false, 'Insufficient permissions for this institute', null, 403);
    }

    // Get institute
    const institute = await prisma.institutes.findUnique({
      where: { instituteId },
      include: { university: true },
    });

    if (!institute) {
      return createApiResponse(false, 'Institute not found', null, 404);
    }

    const body = await request.json();
    const { csvData } = body;

    if (!csvData) {
      return createApiResponse(false, 'CSV data is required', null, 400);
    }

    // Parse CSV
    let students;
    try {
      students = parseCSV(csvData);
    } catch (error) {
      return createApiResponse(false, 'Invalid CSV format', null, 400);
    }

    if (students.length === 0) {
      return createApiResponse(false, 'No student data found in CSV', null, 400);
    }

    // Validate all students
    const validationResults = students.map((student, index) => ({
      index,
      student,
      validation: validateStudentData(student),
    }));

    const invalidStudents = validationResults.filter(r => !r.validation.isValid);
    
    if (invalidStudents.length > 0) {
      return createApiResponse(
        false,
        'Validation errors found',
        {
          errors: invalidStudents.map(s => ({
            row: s.index + 2, // +2 because we skip header and use 1-based indexing
            enrollment_id: s.student.enrollment_id,
            errors: s.validation.errors,
          })),
        },
        400
      );
    }

    // Process valid students
    const results = {
      created: 0,
      updated: 0,
      errors: [] as any[],
    };

    for (const studentData of students) {
      try {
        // Check if student already exists
        const existingStudent = await prisma.students.findUnique({
          where: { enrollment_id: studentData.enrollment_id },
        });

        if (existingStudent) {
          // Update existing student
          await prisma.students.update({
            where: { enrollment_id: studentData.enrollment_id },
            data: {
              name: studentData.name,
              dob: studentData.dob ? new Date(studentData.dob) : null,
              program: studentData.program || null,
              branch: studentData.branch || null,
              yearOfAdmission: studentData.year_of_admission ? parseInt(studentData.year_of_admission) : null,
              email: studentData.email || null,
              phone: studentData.phone || null,
              meta: {
                uploadedBy: user.userId,
                uploadedAt: new Date(),
              },
            },
          });
          
          results.updated++;
        } else {
          // Create new student
          await prisma.students.create({
            data: {
              instituteId,
              enrollment_id: studentData.enrollment_id,
              name: studentData.name,
              dob: studentData.dob ? new Date(studentData.dob) : null,
              program: studentData.program || null,
              branch: studentData.branch || null,
              yearOfAdmission: studentData.year_of_admission ? parseInt(studentData.year_of_admission) : null,
              email: studentData.email || null,
              phone: studentData.phone || null,
              meta: {
                uploadedBy: user.userId,
                uploadedAt: new Date(),
              },
            },
          });
          
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          enrollment_id: studentData.enrollment_id,
          error: 'Database error during processing',
        });
      }
    }

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        actorUser: user.userId,
        action: 'STUDENTS_BULK_UPLOAD',
        objectType: 'STUDENTS',
        objectId: instituteId,
        detail: {
          institeName: institute.name,
          universityName: institute.university.name,
          totalStudents: students.length,
          created: results.created,
          updated: results.updated,
          errors: results.errors.length,
        },
      },
    });

    return createApiResponse(
      true,
      'Students processed successfully',
      {
        summary: {
          totalProcessed: students.length,
          created: results.created,
          updated: results.updated,
          errors: results.errors.length,
        },
        errors: results.errors,
      }
    );

  } catch (error) {
    console.error('Upload students error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}