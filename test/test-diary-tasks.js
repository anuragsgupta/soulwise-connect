const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDiaryAndTasks() {
  console.log('🧪 Testing Diary & Tasks System...\n');

  try {
    // Find test student
    const testStudent = await prisma.student.findFirst({
      where: { email: 'student.test@testuniv.edu' }
    });

    if (!testStudent) {
      console.log('❌ No test student found. Please run setup-test-data.js first.');
      return;
    }

    console.log('✅ Found test student:', testStudent.name);
    console.log('   Student ID:', testStudent.id);

    // Test Diary Entry Creation
    console.log('\n📝 Testing Diary Entry Creation...');
    const diaryEntry = await prisma.diaryEntry.create({
      data: {
        studentId: testStudent.id,
        title: 'My First Journal Entry',
        content: 'Today was a great day! I learned so much about mental health and well-being. The new diary feature is amazing and helps me reflect on my thoughts.',
        mood: 'happy',
        tags: ['wellness', 'learning', 'reflection'],
        wordCount: 27,
        charCount: 156
      }
    });
    console.log('✅ Created diary entry:', diaryEntry.title);
    console.log('   Mood:', diaryEntry.mood);
    console.log('   Tags:', JSON.stringify(diaryEntry.tags));
    console.log('   Word Count:', diaryEntry.wordCount);

    // Test Task Creation
    console.log('\n✅ Testing Task Creation...');
    const task = await prisma.task.create({
      data: {
        studentId: testStudent.id,
        title: 'Complete assignment for Mental Health class',
        description: 'Write a 500-word essay on stress management techniques',
        priority: 'high',
        category: 'academic',
        status: 'in-progress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completed: false
      }
    });
    console.log('✅ Created task:', task.title);
    console.log('   Priority:', task.priority);
    console.log('   Category:', task.category);
    console.log('   Status:', task.status);
    console.log('   Due Date:', task.dueDate?.toLocaleDateString());

    // Fetch all diary entries
    console.log('\n📖 Fetching all diary entries...');
    const allDiaryEntries = await prisma.diaryEntry.findMany({
      where: { studentId: testStudent.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${allDiaryEntries.length} diary entries`);

    // Fetch all tasks
    console.log('\n📋 Fetching all tasks...');
    const allTasks = await prisma.task.findMany({
      where: { studentId: testStudent.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${allTasks.length} tasks`);

    // Test Task Update (mark as completed)
    console.log('\n✅ Testing Task Completion...');
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        completed: true,
        completedAt: new Date(),
        status: 'completed'
      }
    });
    console.log('✅ Task marked as completed:', updatedTask.title);
    console.log('   Completed At:', updatedTask.completedAt?.toLocaleString());

    // Test Statistics
    console.log('\n📊 Generating Statistics...');
    const stats = {
      totalDiaryEntries: await prisma.diaryEntry.count({
        where: { studentId: testStudent.id }
      }),
      totalTasks: await prisma.task.count({
        where: { studentId: testStudent.id }
      }),
      completedTasks: await prisma.task.count({
        where: { studentId: testStudent.id, completed: true }
      }),
      pendingTasks: await prisma.task.count({
        where: { studentId: testStudent.id, completed: false }
      }),
      happyMoods: await prisma.diaryEntry.count({
        where: { studentId: testStudent.id, mood: 'happy' }
      })
    };

    console.log('📈 Statistics:');
    console.log('   Total Diary Entries:', stats.totalDiaryEntries);
    console.log('   Total Tasks:', stats.totalTasks);
    console.log('   Completed Tasks:', stats.completedTasks);
    console.log('   Pending Tasks:', stats.pendingTasks);
    console.log('   Happy Diary Entries:', stats.happyMoods);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma db push');
    console.log('3. Start dev server: npm run dev');
    console.log('4. Login and test the diary & tasks features!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDiaryAndTasks();
