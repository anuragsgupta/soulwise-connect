const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 Setting up test data for mood tracking...\n');

    // Check if test university exists
    let testUniversity = await prisma.university.findFirst({
      where: { domain: 'testuniv.edu' }
    });

    if (!testUniversity) {
      console.log('📚 Creating test university...');
      testUniversity = await prisma.university.create({
        data: {
          name: 'Test University',
          email: 'admin@testuniv.edu',
          domain: 'testuniv.edu',
          phone: '+1-555-0123',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State'
        }
      });
      console.log('✅ Created test university:', testUniversity.name);
    } else {
      console.log('✅ Test university already exists:', testUniversity.name);
    }

    // Check if test institute exists
    let testInstitute = await prisma.institute.findFirst({
      where: { code: 'TEST-INST' }
    });

    if (!testInstitute) {
      console.log('🏛️ Creating test institute...');
      testInstitute = await prisma.institute.create({
        data: {
          code: 'TEST-INST',
          name: 'Test Institute of Technology',
          email: 'institute@testuniv.edu',
          phone: '+1-555-0124',
          address: '456 Institute Avenue',
          universityId: testUniversity.id
        }
      });
      console.log('✅ Created test institute:', testInstitute.name);
    } else {
      console.log('✅ Test institute already exists:', testInstitute.name);
    }

    // Check if test department exists
    let testDepartment = await prisma.department.findFirst({
      where: { code: 'CSE' }
    });

    if (!testDepartment) {
      console.log('🔬 Creating test department...');
      testDepartment = await prisma.department.create({
        data: {
          code: 'CSE',
          name: 'Computer Science & Engineering',
          instituteId: testInstitute.id
        }
      });
      console.log('✅ Created test department:', testDepartment.name);
    } else {
      console.log('✅ Test department already exists:', testDepartment.name);
    }

    // Check if test batch exists
    let testBatch = await prisma.batch.findFirst({
      where: { name: '2023-2027' }
    });

    if (!testBatch) {
      console.log('👥 Creating test batch...');
      testBatch = await prisma.batch.create({
        data: {
          name: '2023-2027',
          startYear: 2023,
          endYear: 2027,
          currentSemester: 3,
          departmentId: testDepartment.id
        }
      });
      console.log('✅ Created test batch:', testBatch.name);
    } else {
      console.log('✅ Test batch already exists:', testBatch.name);
    }

    // Check if test student exists
    let testStudent = await prisma.student.findFirst({
      where: { email: 'student.test@testuniv.edu' }
    });

    if (!testStudent) {
      console.log('👤 Creating test student...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      testStudent = await prisma.student.create({
        data: {
          name: 'John Doe',
          email: 'student.test@testuniv.edu',
          enrollmentId: 'TEST2023001',
          rollNumber: 'CSE2023001',
          passwordHash: hashedPassword,
          phone: '+1-555-0125',
          currentSemester: 3,
          cgpa: 8.5,
          admissionYear: 2023,
          universityId: testUniversity.id,
          instituteId: testInstitute.id,
          departmentId: testDepartment.id,
          batchId: testBatch.id
        }
      });
      console.log('✅ Created test student:', testStudent.name);
      console.log('   📧 Email:', testStudent.email);
      console.log('   🆔 Enrollment ID:', testStudent.enrollmentId);
      console.log('   🔑 Password: password123');
    } else {
      console.log('✅ Test student already exists:', testStudent.name);
    }

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\n📝 You can now test mood tracking with:');
    console.log(`   Student ID: ${testStudent.id}`);
    console.log(`   Email: ${testStudent.email}`);
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();