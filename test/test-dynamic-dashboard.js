const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testStudentData() {
  console.log('🧪 Testing dynamic dashboard student data...\n');

  try {
    // Find our test student with full relational data
    const testStudent = await prisma.student.findUnique({
      where: {
        email: 'student.test@testuniv.edu'
      },
      include: {
        university: true,
        institute: true,
        department: true,
        batch: true
      }
    });

    if (!testStudent) {
      console.log('❌ Test student not found. Please run setup-test-data.js first.');
      return;
    }

    console.log('✅ Found test student with full details:');
    console.log('📋 Student Information:');
    console.log(`   Name: ${testStudent.name}`);
    console.log(`   Email: ${testStudent.email}`);
    console.log(`   Enrollment ID: ${testStudent.enrollmentId}`);
    console.log(`   Roll Number: ${testStudent.rollNumber}`);
    console.log(`   Current Semester: ${testStudent.currentSemester}`);
    console.log(`   CGPA: ${testStudent.cgpa}`);
    console.log(`   Admission Year: ${testStudent.admissionYear}`);

    console.log('\n🏢 Institutional Details:');
    console.log(`   University: ${testStudent.university.name}`);
    console.log(`   Institute: ${testStudent.institute.name}`);
    console.log(`   Department: ${testStudent.department.name}`);
    console.log(`   Batch: ${testStudent.batch.name} (${testStudent.batch.startYear}-${testStudent.batch.endYear})`);

    // Test authentication data structure (simulating auth context)
    const authUserData = {
      id: testStudent.id,
      email: testStudent.email,
      name: testStudent.name,
      userType: 'STUDENT',
      rollNumber: testStudent.rollNumber,
      batchId: testStudent.batchId,
      universityId: testStudent.universityId,
      instituteId: testStudent.instituteId,
      university: testStudent.university,
      institute: testStudent.institute,
      department: testStudent.department,
      batch: testStudent.batch
    };

    console.log('\n🔧 Auth Context Data (for dashboard):');
    console.log('   Student ID:', authUserData.id);
    console.log('   Display Name:', authUserData.name || 'Student');
    console.log('   Roll Number:', authUserData.rollNumber);
    console.log('   Batch Info:', authUserData.batch?.name);
    console.log('   Department:', authUserData.department?.name);
    console.log('   Institute:', authUserData.institute?.name);

    console.log('\n📊 Dashboard Display Preview:');
    console.log(`   Welcome Header: "Welcome back, ${authUserData.name || 'Student'}! 👋"`);
    console.log(`   Roll Number: "Roll Number: ${authUserData.rollNumber}"`);
    if (authUserData.batch?.name) {
      console.log(`   Batch: "Batch: ${authUserData.batch.name}"`);
    }
    if (testStudent.currentSemester) {
      console.log(`   Current Semester: "Semester: ${testStudent.currentSemester}"`);
    }
    if (authUserData.department?.name) {
      console.log(`   Department: "Department: ${authUserData.department.name}"`);
    }
    if (authUserData.institute?.name) {
      console.log(`   Institute: "Institute: ${authUserData.institute.name}"`);
    }

    // Check for recent mood data
    const recentMoodData = await prisma.moodCheckIn.findMany({
      where: {
        studentId: testStudent.id
      },
      orderBy: {
        checkInDate: 'desc'
      },
      take: 5
    });

    console.log('\n🎭 Recent Mood Data:');
    if (recentMoodData.length > 0) {
      recentMoodData.forEach((mood, index) => {
        const date = new Date(mood.checkInDate).toLocaleDateString();
        console.log(`   ${index + 1}. ${date}: ${mood.moodLabel} (${mood.moodScore}/5)`);
      });
    } else {
      console.log('   No mood check-ins yet.');
    }

    console.log('\n🎉 Dynamic dashboard data test completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Login with: student.test@testuniv.edu / password123');
    console.log('3. Verify dynamic student name and details display correctly');
    console.log('4. Test mood tracking functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testStudentData();