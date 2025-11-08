// Simple API Test using Node.js
const testAPIs = async () => {
  const BASE_URL = 'http://localhost:3000'
  
  console.log('🧪 Testing API Routes...\n')
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing /api/health')
    const healthRes = await fetch(`${BASE_URL}/api/health`)
    const healthData = await healthRes.json()
    console.log('✅ Health:', healthData)
    
    // Test 2: Registration Count
    console.log('\n2️⃣ Testing /api/registrations/count')
    const countRes = await fetch(`${BASE_URL}/api/registrations/count`)
    const countData = await countRes.json()
    console.log('✅ Count:', countData)
    
    // Test 3: Create Registration
    console.log('\n3️⃣ Testing POST /api/registrations')
    const regRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        chapterName: 'Test Chapter',
        category: 'Professional',
        contactNo: '+919876543210',
        email: `test${Date.now()}@example.com`,
        ticketType: 'Silver'
      })
    })
    const regData = await regRes.json()
    console.log('✅ Registration:', regData)
    
    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAPIs()
