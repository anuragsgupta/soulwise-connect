/**
 * Test Script for Faculty API endpoint
 * 
 * This script tests the /api/sessions/faculty endpoint
 * to see what data is being returned.
 * 
 * Run with: node test-faculty-api.js
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

async function main() {
  console.log('🧪 Testing Faculty API Endpoint...\n');

  try {
    // Find test student
    const student = await prisma.student.findFirst({
      where: { email: 'test.student@example.com' },
      include: {
        institute: true,
      },
    });

    if (!student) {
      console.error('❌ Test student not found. Please run test-session-booking.js first.');
      return;
    }

    console.log('✅ Found test student:', student.name);
    console.log('   Institute:', student.institute.name);
    console.log('   Institute ID:', student.instituteId);

    // Generate a token for the student
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        userType: 'STUDENT',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n🔑 Generated JWT token for testing');

    // Fetch faculty from the same institute using Prisma
    const facultiesDirect = await prisma.faculty.findMany({
      where: {
        instituteId: student.instituteId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
        facultyType: true,
        availabilityStatus: true,
        yearsOfExperience: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { facultyType: 'asc' },
        { name: 'asc' },
      ],
    });

    console.log(`\n📊 Direct Prisma Query Results:`);
    console.log(`   Found ${facultiesDirect.length} faculty member(s) in institute ${student.instituteId}\n`);

    if (facultiesDirect.length === 0) {
      console.log('⚠️  No faculty found. Checking all faculties in database...\n');
      
      const allFaculties = await prisma.faculty.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          instituteId: true,
          status: true,
          institute: {
            select: {
              name: true,
            },
          },
        },
      });

      console.log(`Total faculties in database: ${allFaculties.length}\n`);
      allFaculties.forEach((faculty, index) => {
        console.log(`${index + 1}. ${faculty.name}`);
        console.log(`   Email: ${faculty.email}`);
        console.log(`   Institute: ${faculty.institute?.name || 'N/A'}`);
        console.log(`   Institute ID: ${faculty.instituteId}`);
        console.log(`   Status: ${faculty.status}`);
        console.log(`   Match: ${faculty.instituteId === student.instituteId ? '✅ YES' : '❌ NO'}`);
        console.log('');
      });

      console.log('\n🔍 Issue Identified:');
      console.log('   The student and faculty are in different institutes.');
      console.log(`   Student Institute ID: ${student.instituteId}`);
      console.log('   You need to either:');
      console.log('   1. Update faculty to be in the same institute as the student, OR');
      console.log('   2. Create new faculty in the student\'s institute');
    } else {
      facultiesDirect.forEach((faculty, index) => {
        console.log(`${index + 1}. ${faculty.name}`);
        console.log(`   Email: ${faculty.email}`);
        console.log(`   Type: ${faculty.facultyType}`);
        console.log(`   Department: ${faculty.department.name} (${faculty.department.code})`);
        console.log(`   Job Title: ${faculty.jobTitle || 'N/A'}`);
        console.log(`   Availability: ${faculty.availabilityStatus}`);
        console.log(`   Experience: ${faculty.yearsOfExperience || 'N/A'} years`);
        console.log('');
      });
    }

    console.log('============================================================');
    console.log('✅ Faculty API Test Complete');
    console.log('============================================================\n');

    console.log('🔧 To fix the issue, run this SQL:');
    console.log(`UPDATE faculties SET institute_id = '${student.instituteId}' WHERE email = 'test.faculty@example.com';`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
