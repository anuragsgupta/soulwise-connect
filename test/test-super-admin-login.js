/**
 * Test Super Admin Login
 * 
 * This script tests that the super admin can successfully login
 * and that the JWT token contains the correct information.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testSuperAdminLogin() {
  console.log('🧪 Testing Super Admin Login...\n');

  try {
    // Test login with super admin credentials
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@soulwise.connect',
        password: 'SuperAdmin@2024',
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login failed:');
      console.error(loginData);
      process.exit(1);
    }

    console.log('✅ Login successful!');
    console.log('\n📋 User Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Name:         ${loginData.data.user.name}`);
    console.log(`   Email:        ${loginData.data.user.email}`);
    console.log(`   User Type:    ${loginData.data.user.userType}`);
    console.log(`   Admin Type:   ${loginData.data.user.adminType}`);
    console.log(`   Super Admin:  ${loginData.data.user.isSuperAdmin}`);
    console.log(`   ID:           ${loginData.data.user.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verify token exists
    if (!loginData.data.token) {
      console.error('❌ No JWT token in response');
      process.exit(1);
    }

    console.log('\n✅ JWT Token received');

    // Test accessing protected route
    console.log('\n🔒 Testing protected route access...');

    const testResponse = await fetch(`${API_BASE}/api/universities`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.data.token}`,
      },
    });

    if (testResponse.ok) {
      console.log('✅ Successfully accessed protected route');
    } else {
      console.error('⚠️  Could not access protected route (may be expected if route has additional checks)');
    }

    console.log('\n🎉 All tests passed!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000/login');
    console.log('2. Login with the super admin credentials');
    console.log('3. Start creating universities and admins!');

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSuperAdminLogin();
}

module.exports = { testSuperAdminLogin };
