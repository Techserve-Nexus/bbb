// Quick Admin API Test
async function testAdminAPI() {
  console.log('🧪 Testing Admin API...\n');

  const email = 'rkj9023@gmail.com';
  const password = 'Rajesh@1234';

  try {
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('📡 Sending request...\n');

    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: {
        'x-admin-email': email,
        'x-admin-password': password
      }
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('\n📊 Stats:');
      console.log('  Total Users:', data.stats.total);
      console.log('  Verified:', data.stats.payments.success);
      console.log('  Pending:', data.stats.payments.pending);
      console.log('  Failed:', data.stats.payments.failed);
      
      if (data.users.length > 0) {
        console.log('\n👤 Sample User:');
        const user = data.users[0];
        console.log('  ID:', user.registrationId);
        console.log('  Name:', user.name);
        console.log('  Email:', user.email);
      }
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ REQUEST ERROR!');
    console.log('Message:', error.message);
  }
}

// Wait a bit for server to be ready
setTimeout(testAdminAPI, 2000);
