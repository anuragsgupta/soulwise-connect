const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMoodTracking() {
  try {
    console.log('🧪 Testing mood tracking functionality...\n');

    // First, let's find or create a test student
    let testStudent = await prisma.student.findFirst({
      where: { email: { contains: 'test' } }
    });

    if (!testStudent) {
      console.log('❌ No test student found. Please create a student in the database first.');
      console.log('You can use the admin dashboard to create students.');
      return;
    }

    console.log('✅ Found test student:', testStudent.name, '(' + testStudent.email + ')');

    // Test creating a mood check-in
    const testMoodData = {
      studentId: testStudent.id,
      moodScore: 4,
      moodLabel: 'Good',
      factors: ['sleep', 'exercise', 'social'],
      notes: 'Had a great day with good sleep and exercise!'
    };

    // Check if there's already a check-in for today
    const today = new Date();
    const checkInDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const existingCheckIn = await prisma.moodCheckIn.findFirst({
      where: {
        studentId: testStudent.id,
        checkInDate
      }
    });

    if (existingCheckIn) {
      console.log('📝 Updating existing mood check-in for today...');
      const updatedCheckIn = await prisma.moodCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          moodScore: testMoodData.moodScore,
          moodLabel: testMoodData.moodLabel,
          factors: testMoodData.factors,
          notes: testMoodData.notes
        }
      });
      console.log('✅ Updated mood check-in:', updatedCheckIn);
    } else {
      console.log('📝 Creating new mood check-in...');
      const newCheckIn = await prisma.moodCheckIn.create({
        data: {
          ...testMoodData,
          checkInDate
        }
      });
      console.log('✅ Created mood check-in:', newCheckIn);
    }

    // Test retrieving mood history
    console.log('\n📊 Retrieving mood history (last 7 days)...');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const moodHistory = await prisma.moodCheckIn.findMany({
      where: {
        studentId: testStudent.id,
        checkInDate: {
          gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
          lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        }
      },
      orderBy: {
        checkInDate: 'asc'
      }
    });

    console.log('✅ Mood history:', moodHistory.length, 'entries found');
    moodHistory.forEach(entry => {
      console.log(`  - ${entry.checkInDate.toISOString().split('T')[0]}: ${entry.moodLabel} (${entry.moodScore}/5)`);
    });

    console.log('\n🎉 Mood tracking test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMoodTracking();