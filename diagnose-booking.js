const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 Diagnosing Session Booking System...\n');

  try {
    // Check database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected\n');

    // Check students
    console.log('2️⃣ Checking students...');
    const studentCount = await prisma.student.count();
    console.log(`   📊 Total students: ${studentCount}`);
    
    if (studentCount > 0) {
      const sampleStudent = await prisma.student.findFirst({
        include: {
          institute: {
            select: { name: true }
          }
        }
      });
      console.log(`   👤 Sample student: ${sampleStudent.name} (${sampleStudent.email})`);
      console.log(`   🏫 Institute: ${sampleStudent.institute.name}`);
      console.log(`   🆔 Institute ID: ${sampleStudent.instituteId}\n`);
    } else {
      console.log('   ⚠️  No students found in database\n');
    }

    // Check faculty
    console.log('3️⃣ Checking faculty...');
    const facultyCount = await prisma.faculty.count();
    console.log(`   📊 Total faculty: ${facultyCount}`);
    
    if (facultyCount > 0) {
      const sampleFaculty = await prisma.faculty.findFirst({
        include: {
          institute: {
            select: { name: true }
          },
          department: {
            select: { name: true }
          }
        }
      });
      console.log(`   👨‍🏫 Sample faculty: ${sampleFaculty.name} (${sampleFaculty.email})`);
      console.log(`   🏫 Institute: ${sampleFaculty.institute.name}`);
      console.log(`   🆔 Institute ID: ${sampleFaculty.instituteId}`);
      console.log(`   📚 Department: ${sampleFaculty.department.name}\n`);
    } else {
      console.log('   ⚠️  No faculty found in database\n');
    }

    // Check if student and faculty share same institute
    if (studentCount > 0 && facultyCount > 0) {
      console.log('4️⃣ Checking institute alignment...');
      const student = await prisma.student.findFirst();
      const facultyInSameInstitute = await prisma.faculty.findMany({
        where: {
          instituteId: student.instituteId
        }
      });
      console.log(`   🎯 Faculty in student's institute: ${facultyInSameInstitute.length}`);
      
      if (facultyInSameInstitute.length === 0) {
        console.log('   ❌ PROBLEM: No faculty in same institute as student!');
        console.log('   💡 Solution: Run seed script to create matching data\n');
      } else {
        console.log('   ✅ Faculty and students share institutes\n');
      }
    }

    // Check session bookings
    console.log('5️⃣ Checking session bookings...');
    const sessionCount = await prisma.sessionBooking.count();
    console.log(`   📊 Total sessions: ${sessionCount}`);
    
    if (sessionCount > 0) {
      const recentSessions = await prisma.sessionBooking.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          student: {
            select: { name: true }
          },
          faculty: {
            select: { name: true }
          }
        }
      });
      console.log('   📋 Recent sessions:');
      recentSessions.forEach(s => {
        console.log(`      - ${s.title} (${s.status}) - ${s.student.name} → ${s.faculty.name}`);
      });
    } else {
      console.log('   ℹ️  No session bookings yet');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 SUMMARY');
    console.log('='.repeat(60));
    
    if (studentCount === 0 || facultyCount === 0) {
      console.log('❌ DATABASE IS EMPTY');
      console.log('   Run: npx tsx prisma/seed-full.ts');
    } else if (studentCount > 0 && facultyCount > 0) {
      const student = await prisma.student.findFirst();
      const facultyInSameInstitute = await prisma.faculty.findMany({
        where: { instituteId: student.instituteId }
      });
      
      if (facultyInSameInstitute.length === 0) {
        console.log('❌ DATA MISMATCH');
        console.log('   Students and faculty are in different institutes');
        console.log('   Run: npx tsx prisma/seed-full.ts');
      } else {
        console.log('✅ ALL GOOD!');
        console.log(`   ${studentCount} students can book with ${facultyInSameInstitute.length} faculty`);
        console.log('\n   Test login credentials:');
        const testStudent = await prisma.student.findFirst();
        const testFaculty = await prisma.faculty.findFirst({
          where: { instituteId: testStudent.instituteId }
        });
        console.log(`   Student: ${testStudent.email}`);
        console.log(`   Faculty: ${testFaculty.email}`);
        console.log(`   Password: 12345678`);
      }
    }
    
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection failed. Check your .env file:');
      console.log('   DATABASE_URL should be set correctly');
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
