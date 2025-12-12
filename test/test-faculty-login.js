const fetch = require('node-fetch');

async function testFacultyLogin() {
  console.log('🧪 Testing Faculty Login...\n');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.faculty@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Faculty Login Successful!');
      console.log('\n📊 User Data:');
      console.log('   Name:', data.data.user.name);
      console.log('   Email:', data.data.user.email);
      console.log('   User Type:', data.data.user.userType);
      console.log('   Faculty Type:', data.data.user.facultyType);
      console.log('   Department ID:', data.data.user.departmentId);
      console.log('   Institute ID:', data.data.user.instituteId);
      console.log('\n🔑 Token:', data.data.token.substring(0, 50) + '...');
      console.log('\n✨ After login, you should be redirected to: /faculty');
    } else {
      console.log('❌ Login Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFacultyLogin();
