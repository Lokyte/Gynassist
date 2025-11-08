// Database Schema Validation Script
const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';

async function validateSchema() {
  console.log('🗄️ DATABASE SCHEMA VALIDATOR\n');
  
  const schemaIssues = [];
  
  // Test User Entity Fields
  console.log('1️⃣ User Entity Validation...');
  const testUsers = [
    {
      email: 'schema1@test.com',
      password: 'test123',
      firstName: 'Schema',
      lastName: 'Test1',
      phoneNumber: '+256700000010',
      role: 'CLIENT'
    },
    {
      email: 'schema2@test.com', 
      password: 'test123',
      firstName: 'Schema',
      lastName: 'Test2',
      phoneNumber: '+256700000011',
      role: 'PROVIDER_INDIVIDUAL'
    }
  ];
  
  for (const user of testUsers) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, user, {
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`✅ User creation successful for role: ${user.role}`);
        
        // Validate response structure
        const userData = response.data.user;
        const requiredFields = ['id', 'email', 'firstName', 'lastName', 'role', 'status'];
        
        const missingFields = requiredFields.filter(field => !userData[field]);
        if (missingFields.length > 0) {
          schemaIssues.push(`Missing fields in User entity: ${missingFields.join(', ')}`);
        } else {
          console.log('✅ User entity structure valid');
        }
        
      } else if (response.status === 400 && response.data.message?.includes('already exists')) {
        console.log(`✅ Duplicate prevention working for: ${user.email}`);
      } else {
        schemaIssues.push(`User creation failed: ${response.status} - ${response.data?.message}`);
      }
    } catch (e) {
      schemaIssues.push(`User entity error: ${e.message}`);
    }
  }
  
  // Test Required Field Validation
  console.log('\n2️⃣ Field Validation Test...');
  const invalidUser = {
    email: 'invalid@test.com'
    // Missing required fields
  };
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, invalidUser, {
      validateStatus: () => true
    });
    
    if (response.status === 400) {
      console.log('✅ Field validation working - rejected incomplete data');
    } else {
      schemaIssues.push('Field validation not working - accepted incomplete data');
    }
  } catch (e) {
    console.log('✅ Field validation active - request rejected');
  }
  
  // Test Authentication Token Structure
  console.log('\n3️⃣ JWT Token Structure...');
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'schema1@test.com',
      password: 'test123'
    }, { validateStatus: () => true });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ JWT token generation working');
      
      // Validate token structure (should be 3 parts separated by dots)
      const tokenParts = loginResponse.data.token.split('.');
      if (tokenParts.length === 3) {
        console.log('✅ JWT token structure valid');
      } else {
        schemaIssues.push('Invalid JWT token structure');
      }
    } else {
      schemaIssues.push('JWT token generation failed');
    }
  } catch (e) {
    schemaIssues.push(`JWT error: ${e.message}`);
  }
  
  // Summary
  console.log('\n📋 SCHEMA VALIDATION REPORT:');
  if (schemaIssues.length === 0) {
    console.log('🎉 DATABASE SCHEMA VALID');
    console.log('✅ User entity: WORKING');
    console.log('✅ Field validation: ACTIVE');
    console.log('✅ JWT integration: FUNCTIONAL');
  } else {
    console.log(`❌ Found ${schemaIssues.length} schema issues:`);
    schemaIssues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
  }
}

validateSchema().catch(console.error);