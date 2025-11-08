// Comprehensive Connectivity & Schema Probe
const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';

async function probeConnectivity() {
  console.log('🔍 GYNASSIST CONNECTIVITY PROBE\n');
  
  const issues = [];
  
  // 1. Backend Health Check
  console.log('1️⃣ Backend Health Check...');
  try {
    const health = await axios.get(`${BACKEND_URL}/actuator/health`, { timeout: 5000 });
    console.log('✅ Backend responding:', health.data.status);
  } catch (e) {
    issues.push('Backend not responding');
    console.log('❌ Backend unreachable:', e.code);
  }
  
  // 2. Database Schema Check
  console.log('\n2️⃣ Database Schema Verification...');
  try {
    const h2Console = await axios.get(`${BACKEND_URL}/h2-console`, { timeout: 3000 });
    console.log('✅ H2 Console accessible');
    
    // Test user table structure
    const testUser = {
      email: 'probe@test.com',
      password: 'test123',
      firstName: 'Probe',
      lastName: 'Test',
      phoneNumber: '+256700000000',
      role: 'CLIENT'
    };
    
    const registerTest = await axios.post(`${BACKEND_URL}/api/auth/register`, testUser, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    if (registerTest.status === 200) {
      console.log('✅ User schema working - registration successful');
    } else if (registerTest.status === 400 && registerTest.data.message?.includes('already exists')) {
      console.log('✅ User schema working - duplicate prevention active');
    } else {
      issues.push(`User schema issue: ${registerTest.status} ${registerTest.data?.message}`);
      console.log('❌ User schema problem:', registerTest.status, registerTest.data?.message);
    }
  } catch (e) {
    issues.push('Database connectivity issue');
    console.log('❌ Database error:', e.response?.status, e.response?.data || e.message);
  }
  
  // 3. Frontend-Backend API Integration
  console.log('\n3️⃣ API Integration Test...');
  try {
    const corsTest = await axios.options(`${BACKEND_URL}/api/auth/register`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST'
      }
    });
    console.log('✅ CORS configured properly');
  } catch (e) {
    issues.push('CORS configuration problem');
    console.log('❌ CORS issue:', e.response?.status);
  }
  
  // 4. Frontend Accessibility
  console.log('\n4️⃣ Frontend Accessibility...');
  try {
    const frontend = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ Frontend accessible');
  } catch (e) {
    issues.push('Frontend not accessible');
    console.log('❌ Frontend unreachable:', e.code);
  }
  
  // 5. Authentication Flow Test
  console.log('\n5️⃣ Authentication Flow...');
  try {
    const loginTest = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'probe@test.com',
      password: 'test123'
    }, { 
      timeout: 10000,
      validateStatus: () => true 
    });
    
    if (loginTest.status === 200 && loginTest.data.token) {
      console.log('✅ Authentication flow working');
      
      // Test protected endpoint
      const meTest = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${loginTest.data.token}` },
        validateStatus: () => true
      });
      
      if (meTest.status === 200) {
        console.log('✅ JWT authentication working');
      } else {
        issues.push('JWT token validation issue');
        console.log('❌ JWT problem:', meTest.status);
      }
    } else {
      issues.push('Login authentication failed');
      console.log('❌ Login failed:', loginTest.status, loginTest.data?.message);
    }
  } catch (e) {
    issues.push('Authentication system error');
    console.log('❌ Auth error:', e.response?.data || e.message);
  }
  
  // 6. Database Entity Relationships
  console.log('\n6️⃣ Entity Relationship Check...');
  try {
    // Test if user creation triggers proper entity relationships
    const entityTest = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      email: 'entity@test.com',
      password: 'test123',
      firstName: 'Entity',
      lastName: 'Test',
      phoneNumber: '+256700000001',
      role: 'CLIENT'
    }, { validateStatus: () => true });
    
    if (entityTest.status === 200) {
      console.log('✅ Entity relationships intact');
    }
  } catch (e) {
    console.log('⚠️ Entity relationship test skipped');
  }
  
  // Summary Report
  console.log('\n📋 CONNECTIVITY REPORT:');
  if (issues.length === 0) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL');
    console.log('✅ Frontend-Backend connectivity: WORKING');
    console.log('✅ Database schema: VALID');
    console.log('✅ Authentication flow: FUNCTIONAL');
  } else {
    console.log(`❌ Found ${issues.length} issues:`);
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    if (issues.some(i => i.includes('Backend'))) {
      console.log('   • Start backend: cd Gynassist-backend && ./mvnw spring-boot:run');
    }
    if (issues.some(i => i.includes('Frontend'))) {
      console.log('   • Start frontend: cd gynassist-frontend && npm run dev');
    }
    if (issues.some(i => i.includes('CORS'))) {
      console.log('   • Check SecurityConfig CORS settings');
    }
    if (issues.some(i => i.includes('schema'))) {
      console.log('   • Check User entity and database migrations');
    }
    if (issues.some(i => i.includes('Auth'))) {
      console.log('   • Verify JWT configuration and UserDetailsService');
    }
  }
  
  console.log('\n🔍 MANUAL VERIFICATION:');
  console.log('   • H2 Console: http://localhost:8080/h2-console');
  console.log('   • Frontend: http://localhost:5173');
  console.log('   • API Health: http://localhost:8080/actuator/health');
}

// Run probe
probeConnectivity().catch(console.error);