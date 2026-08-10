// Test script to verify login response structure
const axios = require('axios');

const BASE_URL = 'https://fintrack-api-6mz4.onrender.com';

async function testLogin() {
  try {
    console.log('🧪 Testing login response...\n');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'demo@fintrack.com',
      password: 'Demo@2026#'
    });

    console.log('✅ Login successful!');
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user && response.data.user.role) {
      console.log('\n✅ Role field exists:', response.data.user.role);
    } else {
      console.log('\n❌ Role field missing in response!');
    }

    // Test admin login
    console.log('\n🧪 Testing admin login...\n');
    const adminResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@fintrack.com',
      password: 'Admin@2026#'
    });

    console.log('✅ Admin login successful!');
    console.log('📦 Admin response:', JSON.stringify(adminResponse.data, null, 2));
    
    if (adminResponse.data.user && adminResponse.data.user.role === 'ADMIN') {
      console.log('\n✅ Admin role correct:', adminResponse.data.user.role);
    } else {
      console.log('\n❌ Admin role incorrect or missing!');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLogin();
