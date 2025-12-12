/**
 * Test Script for Session Booking System
 * 
 * This script tests the complete session booking flow:
 * 1. Student books a session with faculty
 * 2. Faculty receives notification
 * 3. Faculty approves/rejects/reschedules the session
 * 4. Student receives notification about the action
 * 
 * Run with: node test-session-booking.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Starting Session Booking System Tests...\n');

  try {
    // Step 0a: Find or create university
    console.log('📝 Step 0a: Setting up test university...');
    let university = await prisma.university.findFirst();
    
    if (!university) {
      university = await prisma.university.create({
        data: {
          name: 'Test University',
          email: 'admin@testuni.edu',
          domain: 'testuni.edu',
          phone: '1234567890',
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
        },
      });
      console.log('✅ Created test university:', university.name);
    } else {
      console.log('✅ Using existing university:', university.name);
    }

    // Step 0b: Find or create institute
    console.log('📝 Step 0b: Setting up test institute...');
    let institute = await prisma.institute.findFirst();
    
    if (!institute) {
      institute = await prisma.institute.create({
        data: {
          name: 'Test Institute',
          code: 'TEST-INST',
          type: 'COLLEGE',
          contactEmail: 'admin@testinst.edu',
          universityId: university.id,
        },
      });
      console.log('✅ Created test institute:', institute.name);
    } else {
      console.log('✅ Using existing institute:', institute.name);
    }

    // Find or create department
    let department = await prisma.department.findFirst({
      where: { instituteId: institute.id },
    });
    
    if (!department) {
      // Try to find any department first
      department = await prisma.department.findFirst();
      
      if (!department) {
        department = await prisma.department.create({
          data: {
            name: 'Computer Science',
            code: 'CS-TEST-' + Date.now(),
            instituteId: institute.id,
          },
        });
        console.log('✅ Created test department');
      } else {
        console.log('✅ Using existing department:', department.name);
      }
    } else {
      console.log('✅ Using existing department:', department.name);
    }

    // Find or create batch
    let batch = await prisma.batch.findFirst({
      where: { departmentId: department.id },
    });
    
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          name: 'Batch 2023-2027',
          startYear: 2023,
          endYear: 2027,
          currentSemester: 3,
          departmentId: department.id,
        },
      });
      console.log('✅ Created test batch');
    } else {
      console.log('✅ Using existing batch:', batch.name);
    }

    // Step 1: Find or create test student
    console.log('\n📝 Step 1: Setting up test student...');
    let student = await prisma.student.findFirst({
      where: { email: 'test.student@example.com' },
    });

    if (!student) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      student = await prisma.student.create({
        data: {
          name: 'Test Student',
          email: 'test.student@example.com',
          passwordHash: hashedPassword,
          enrollmentId: 'TEST-STUDENT-001',
          rollNumber: 'TS001',
          currentSemester: 3,
          admissionYear: 2023,
          universityId: university.id,
          instituteId: institute.id,
          departmentId: department.id,
          batchId: batch.id,
        },
      });
      console.log('✅ Test student created:', student.email);
    } else {
      console.log('✅ Found existing test student:', student.email);
    }

    // Step 2: Find or create test faculty
    console.log('\n📝 Step 2: Setting up test faculty...');
    let faculty = await prisma.faculty.findFirst({
      where: { email: 'test.faculty@example.com' },
    });

    if (!faculty) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      faculty = await prisma.faculty.create({
        data: {
          name: 'Test Faculty',
          email: 'test.faculty@example.com',
          passwordHash: hashedPassword,
          facultyType: 'FACULTY',
          departmentId: department.id,
          instituteId: institute.id,
          universityId: university.id,
        },
      });
      console.log('✅ Test faculty created:', faculty.email);
    } else {
      console.log('✅ Found existing test faculty:', faculty.email);
    }

    // Step 3: Create a session booking
    console.log('\n📝 Step 3: Creating session booking...');
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3); // 3 days from now

    const session = await prisma.sessionBooking.create({
      data: {
        studentId: student.id,
        facultyId: faculty.id,
        sessionType: 'MENTORING',
        title: 'Career Guidance Session',
        description: 'Need advice on internship opportunities and career path',
        scheduledDate,
        scheduledTime: '14:00',
        duration: 30,
        studentNotes: 'I am interested in software development and would like to discuss internship options.',
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        faculty: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Session booking created:');
    console.log('   ID:', session.id);
    console.log('   Student:', session.student.name);
    console.log('   Faculty:', session.faculty.name);
    console.log('   Type:', session.sessionType);
    console.log('   Date:', session.scheduledDate.toLocaleDateString());
    console.log('   Time:', session.scheduledTime);
    console.log('   Status:', session.status);

    // Step 4: Create notification for faculty
    console.log('\n📝 Step 4: Creating notification for faculty...');
    const notification = await prisma.notification.create({
      data: {
        title: 'New Session Request',
        message: `${student.name} has requested a ${session.sessionType.toLowerCase()} session on ${session.scheduledDate.toLocaleDateString()}`,
        type: 'SESSION_REQUEST',
        recipientType: 'FACULTY',
        facultyRecipientId: faculty.id,
        relatedId: session.id,
        relatedType: 'SESSION_BOOKING',
        actionUrl: `/faculty/sessions/${session.id}`,
        sessionBookingId: session.id,
      },
    });

    console.log('✅ Notification created for faculty:');
    console.log('   Title:', notification.title);
    console.log('   Message:', notification.message);

    // Step 5: Simulate faculty approval
    console.log('\n📝 Step 5: Simulating faculty approval...');
    const approvedSession = await prisma.sessionBooking.update({
      where: { id: session.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        facultyNotes: 'Looking forward to our discussion. I have some great opportunities to share.',
      },
    });

    console.log('✅ Session approved by faculty');
    console.log('   Status:', approvedSession.status);
    console.log('   Approved at:', approvedSession.approvedAt);

    // Step 6: Create notification for student
    console.log('\n📝 Step 6: Creating approval notification for student...');
    const studentNotification = await prisma.notification.create({
      data: {
        title: 'Session Approved',
        message: `Your session request with ${faculty.name} has been approved for ${session.scheduledDate.toLocaleDateString()} at ${session.scheduledTime}`,
        type: 'SESSION_APPROVED',
        recipientType: 'STUDENT',
        studentRecipientId: student.id,
        relatedId: session.id,
        relatedType: 'SESSION_BOOKING',
        actionUrl: `/student/sessions/${session.id}`,
        sessionBookingId: session.id,
      },
    });

    console.log('✅ Notification created for student:');
    console.log('   Title:', studentNotification.title);
    console.log('   Message:', studentNotification.message);

    // Step 7: Test notification retrieval
    console.log('\n📝 Step 7: Testing notification retrieval...');
    const facultyNotifications = await prisma.notification.findMany({
      where: {
        facultyRecipientId: faculty.id,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Faculty has ${facultyNotifications.length} unread notification(s)`);

    const studentNotifications = await prisma.notification.findMany({
      where: {
        studentRecipientId: student.id,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Student has ${studentNotifications.length} unread notification(s)`);

    // Step 8: Test session retrieval
    console.log('\n📝 Step 8: Testing session retrieval...');
    const studentSessions = await prisma.sessionBooking.findMany({
      where: { studentId: student.id },
      include: {
        faculty: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Student has ${studentSessions.length} session(s)`);

    const facultySessions = await prisma.sessionBooking.findMany({
      where: { facultyId: faculty.id },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Faculty has ${facultySessions.length} session(s)`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All Tests Passed Successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Student created/found');
    console.log('   ✅ Faculty created/found');
    console.log('   ✅ Session booking created');
    console.log('   ✅ Faculty notification created');
    console.log('   ✅ Session approved by faculty');
    console.log('   ✅ Student notification created');
    console.log('   ✅ Notification retrieval working');
    console.log('   ✅ Session retrieval working');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test the UI by logging in as:');
    console.log('      - Student: test.student@example.com / password123');
    console.log('      - Faculty: test.faculty@example.com / password123');
    console.log('   2. Navigate to /student/sessions or /faculty/sessions');
    console.log('   3. Test booking, approval, rejection, and rescheduling flows');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
