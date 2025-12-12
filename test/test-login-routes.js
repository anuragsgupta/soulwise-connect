const fetch = require('node-fetch');

async function testLoginRouting() {
  console.log('🧪 Testing Login Routing for All User Types\n');

  const tests = [
    {
      name: 'Faculty Login',
      credentials: {
        email: 'test.faculty@example.com',
        password: 'password123',
      },
      expectedUserType: 'FACULTY',
      expectedRoute: '/faculty',
    },
    {
      name: 'Student Login (via enrollment)',
      credentials: {
        enrollmentId: 'STU2024001',
        password: 'password123',
      },
      expectedUserType: 'STUDENT',
      expectedRoute: '/dashboard',
    },
  ];

  for (const test of tests) {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log('─'.repeat(50));

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.credentials),
      });

      const data = await response.json();

      if (data.success) {
        const userType = data.data.user.userType;
        const isCorrect = userType === test.expectedUserType;

        console.log(isCorrect ? '✅' : '❌', 'Login Status:', data.success ? 'Success' : 'Failed');
        console.log(isCorrect ? '✅' : '❌', 'User Type:', userType, `(expected: ${test.expectedUserType})`);
        console.log(isCorrect ? '✅' : '❌', 'Will redirect to:', test.expectedRoute);
        console.log('   Name:', data.data.user.name);
        console.log('   Email:', data.data.user.email || 'N/A');
        
        if (test.expectedUserType === 'FACULTY') {
          console.log('   Faculty Type:', data.data.user.facultyType);
          console.log('   Department ID:', data.data.user.departmentId);
        } else if (test.expectedUserType === 'STUDENT') {
          console.log('   Roll Number:', data.data.user.rollNumber);
          console.log('   Batch ID:', data.data.user.batchId);
        }
      } else {
        console.log('❌ Login Failed:', data.message);
        console.log('   This might mean test data is not seeded');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Routing Summary:');
  console.log('   FACULTY → /faculty (FacultyDashboardNew)');
  console.log('   STUDENT → /dashboard (StudentDashboard)');
  console.log('   ADMIN → /dashboard (AdminDashboard)');
  console.log('='.repeat(50));
}

testLoginRouting();
