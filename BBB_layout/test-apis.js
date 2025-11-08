// API Routes Test Script
// Run this in browser console or use node-fetch

const BASE_URL = 'http://localhost:3000'

async function testAPIs() {
  console.log('🧪 Starting API Tests...\n')

  // Test 1: Health Check
  console.log('1️⃣ Testing /api/health')
  try {
    const res = await fetch(`${BASE_URL}/api/health`)
    const data = await res.json()
    console.log('✅ Health Check:', data)
  } catch (error) {
    console.error('❌ Health Check failed:', error.message)
  }

  // Test 2: Registration Count
  console.log('\n2️⃣ Testing /api/registrations/count')
  try {
    const res = await fetch(`${BASE_URL}/api/registrations/count`)
    const data = await res.json()
    console.log('✅ Registration Count:', data)
  } catch (error) {
    console.error('❌ Registration Count failed:', error.message)
  }

  // Test 3: Create Registration
  console.log('\n3️⃣ Testing POST /api/registrations')
  try {
    const testRegistration = {
      name: 'Test User',
      chapterName: 'Test Chapter',
      category: 'Professional',
      contactNo: '+919876543210',
      email: 'test@example.com',
      ticketType: 'Silver',
      children: [],
      participations: ['Chess Tournament'],
      conclavGroups: []
    }
    
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRegistration)
    })
    const data = await res.json()
    console.log('✅ Registration Created:', data)
    
    // Store registrationId for further tests
    if (data.registrationId) {
      window.testRegistrationId = data.registrationId
      console.log('📝 Saved registrationId for further tests:', data.registrationId)
    }
  } catch (error) {
    console.error('❌ Registration Creation failed:', error.message)
  }

  // Test 4: Get Registration by Email
  console.log('\n4️⃣ Testing GET /api/registrations?email=test@example.com')
  try {
    const res = await fetch(`${BASE_URL}/api/registrations?email=test@example.com`)
    const data = await res.json()
    console.log('✅ Registration Retrieved:', data)
  } catch (error) {
    console.error('❌ Registration Retrieval failed:', error.message)
  }

  // Test 5: Generate PDF (if registrationId exists)
  if (window.testRegistrationId) {
    console.log('\n5️⃣ Testing POST /api/tickets/generate-pdf')
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: window.testRegistrationId })
      })
      const data = await res.json()
      console.log('✅ PDF Generation:', data.success ? 'Success' : 'Failed')
    } catch (error) {
      console.error('❌ PDF Generation failed:', error.message)
    }
  }

  console.log('\n✅ All API tests completed!')
}

// Run tests
testAPIs()
