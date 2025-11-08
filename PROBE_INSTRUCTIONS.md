# 🔍 Gynassist Connectivity & Schema Probe

## Quick Probe Execution

### Prerequisites
```bash
# Ensure both services are running
# Terminal 1: Backend
cd Gynassist-backend && ./mvnw spring-boot:run

# Terminal 2: Frontend  
cd gynassist-frontend && npm run dev
```

### Run Comprehensive Probe
```bash
# Full connectivity and schema validation
node connectivity-probe.js

# Database schema specific validation
node schema-validator.js
```

## What the Probe Checks

### 🔗 Connectivity Tests
- ✅ Backend health endpoint
- ✅ Frontend accessibility  
- ✅ CORS configuration
- ✅ API endpoint responses
- ✅ Database connection

### 🗄️ Schema Validation
- ✅ User entity structure
- ✅ Required field validation
- ✅ JWT token generation
- ✅ Authentication flow
- ✅ Entity relationships

### 🔧 Error Detection
- ❌ Missing database tables
- ❌ Field validation failures
- ❌ CORS misconfigurations
- ❌ JWT token issues
- ❌ Connection timeouts

## Expected Output

### ✅ Success Indicators
```
🎉 ALL SYSTEMS OPERATIONAL
✅ Frontend-Backend connectivity: WORKING
✅ Database schema: VALID
✅ Authentication flow: FUNCTIONAL
```

### ❌ Failure Indicators
```
❌ Found X issues:
   1. Backend not responding
   2. CORS configuration problem
   3. User schema issue
```

## Troubleshooting Actions

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Restart backend
cd Gynassist-backend
./mvnw clean spring-boot:run
```

### Frontend Issues  
```bash
# Check if frontend is accessible
curl http://localhost:5173

# Restart frontend
cd gynassist-frontend
npm run dev
```

### Database Issues
```bash
# Access H2 Console
# URL: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:testdb
# Username: sa
# Password: (empty)
```

### CORS Issues
- Check `SecurityConfig.java` CORS configuration
- Verify allowed origins include `http://localhost:5173`
- Ensure all HTTP methods are allowed

## Manual Verification Steps

1. **Backend Health**: Visit http://localhost:8080/actuator/health
2. **Frontend Load**: Visit http://localhost:5173
3. **Registration Test**: Try creating a new user account
4. **Login Test**: Attempt login with created account
5. **Database Check**: Access H2 console and verify user table

## Quick Fix Commands

```bash
# Clean restart everything
./CLEAN_RESTART.bat

# Or manual cleanup
cd Gynassist-backend && ./mvnw clean
cd ../gynassist-frontend && rm -rf node_modules && npm install
npm run start:all
```

---
**Run the probe scripts after any configuration changes to ensure system integrity.**