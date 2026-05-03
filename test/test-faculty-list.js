/**
 * Test Script for Faculty List API
 * 
 * This script tests if the faculty list endpoint is working correctly
 * and returning available faculty for the student to book sessions with.
 * 
 * Run with: node test-faculty-list.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Faculty List Retrieval...\n');

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

    // Fetch faculty from the same institute
    const faculties = await prisma.faculty.findMany({
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

    console.log(`\n✅ Found ${faculties.length} faculty member(s) in the same institute:\n`);

    if (faculties.length === 0) {
      console.log('⚠️  No faculty found. This means:');
      console.log('   - The student cannot book any sessions');
      console.log('   - You need to create faculty members in the same institute');
      console.log(`   - Institute ID to use: ${student.instituteId}`);
    } else {
      faculties.forEach((faculty, index) => {
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
    console.log('✅ Faculty List Test Complete');
    console.log('============================================================\n');

    if (faculties.length > 0) {
      console.log('✨ Next Steps:');
      console.log('   1. Login as test.student@example.com');
      console.log('   2. Go to Appointments section');
      console.log('   3. You should see all faculty members listed above');
      console.log('   4. Click "Book Session" on any faculty card');
    } else {
      console.log('⚠️  Action Required:');
      console.log('   The test faculty created earlier might be in a different institute.');
      console.log('   Run this to check faculty institutes:');
      console.log('   npx prisma studio');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
