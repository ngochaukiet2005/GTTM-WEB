# 🚀 Quick Start Guide - GTTM Backend API

## ⏱️ Time Required: ~5 minutes to get started

---

## 📋 Checklist Before Starting

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed or MongoDB Atlas account
- [ ] Gmail account for email testing
- [ ] Terminal/Command Prompt open

---

## 🎯 Step-by-Step Setup

### Step 1: Start MongoDB (2 options)

**Option A: Local MongoDB**

```bash
# Install MongoDB if not already installed
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod
# You should see: "waiting for connections on port 27017"
```

**Option B: MongoDB Atlas (Cloud)**

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster
4. Get connection string
5. Copy to backend/.env MONGO_URL
```

### Step 2: Setup Gmail for OTP Testing

```
1. Go to https://myaccount.google.com
2. Search for "App passwords"
3. Enable 2-Factor Authentication first
4. Generate App Password for "Mail" + "Windows Computer"
5. Get 16-character password
6. Copy to backend/.env EMAIL_PASS
```

### Step 3: Start Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not done)
npm install

# Start server with auto-reload
npm run dev

# Expected output:
# 🚀 Server running on port 5000
# MongoDB connected
```

### Step 4: Start Frontend Server (Another terminal)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (if not done)
npm install

# Start frontend
npm run dev

# Expected output:
# VITE v5.2.0 ready in XXX ms
# http://localhost:5173
```

### Step 5: Test in Browser

```
1. Open http://localhost:5173
2. Click "Passenger"
3. Click "Sign Up"
4. Fill form and submit
5. Check backend terminal for OTP
6. Verify email with OTP
7. Login
8. Create a trip!
```

---

## 🧪 Quick Test (Without Frontend)

### Test 1: Check if API is running

```bash
curl http://localhost:5000/health
# Expected: {"status":"ok","uptime":X.XX}
```

### Test 2: Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Test User",
    "email":"test@example.com",
    "numberPhone":"0123456789",
    "password":"Test123!",
    "confirmPassword":"Test123!",
    "gender":"MALE"
  }'
```

### Test 3: Check MongoDB

```bash
mongosh
> use smart_shuttle
> db.users.find()
# You should see the new user
```

---

## 📱 Testing Complete Flow

### Passenger Flow

```
1. REGISTER
   └─ POST /api/auth/register
   └─ Fill: email, password, fullName, phone, gender

2. VERIFY EMAIL
   └─ Check terminal for OTP
   └─ POST /api/auth/verify-email
   └─ Use OTP from terminal

3. LOGIN
   └─ POST /api/auth/login
   └─ Get accessToken & refreshToken

4. CREATE TRIP
   └─ POST /api/trips (with Authorization header)
   └─ Fill: ticketCode, pickup, dropoff, timeSlot

5. VIEW TRIPS
   └─ GET /api/trips (with Authorization header)
   └─ See trip history
```

### Driver Flow

```
1. REGISTER as DRIVER
   └─ Same as passenger, but set role: "DRIVER"

2. VERIFY & LOGIN
   └─ Same as passenger

3. VIEW ASSIGNED TRIPS
   └─ GET /api/driver/trips
   └─ (trips assigned by admin)

4. UPDATE STOP STATUS
   └─ PATCH /api/driver/trips/:tripId/stop/:stopId
   └─ Mark pickup/dropoff
```

---

## 🔧 Configuration Quick Reference

### backend/.env

```env
# These are already set up, but you can modify:

PORT=5000
MONGO_URL=mongodb://localhost:27017/smart_shuttle

JWT_SECRET=your-secret-key-here (change in production)
JWT_REFRESH_SECRET=your-refresh-secret-here (change in production)

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=16-char-app-password

# Optional
GOOGLE_MAPS_API_KEY=not-needed-yet
NODE_ENV=development
```

### frontend/.env (if needed)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Problem: "MongoDB connection failed"

```
Solution:
1. Ensure MongoDB is running (mongod command)
2. Or use MongoDB Atlas cloud database
3. Update MONGO_URL in .env
4. Restart backend server
```

### Problem: "Email not sending"

```
Solution:
1. Verify EMAIL_USER is Gmail address
2. Use App Password (not regular password)
3. Enable 2FA on Google account
4. Check /backend/.env has correct EMAIL_PASS
```

### Problem: "Port 5000 already in use"

```
Solution:
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Problem: "401 Unauthorized"

```
Solution:
1. Ensure token is in Authorization header
2. Format: Authorization: Bearer <token>
3. Token expires in 15 minutes
4. Use refreshToken to get new token
5. Check localStorage in browser DevTools
```

### Problem: "Cannot find module"

```
Solution:
1. Ensure dependencies installed: npm install
2. Node modules folder exists: backend/node_modules/
3. Check package.json has all dependencies
4. Delete node_modules and run npm install again
```

---

## 📞 Where to Find Docs

**Getting Started**

- This file: Quick Start Guide

**Detailed Setup**

- `backend/BACKEND_SETUP.md` - Step-by-step guide

**API Reference**

- `API_QUICK_REFERENCE.md` - All endpoints with examples

**System Design**

- `ARCHITECTURE.md` - System diagrams & design

**Testing**

- `FRONTEND_BACKEND_TESTING.md` - Integration testing

**Implementation Details**

- `COMPLETION_REPORT.md` - What was built

---

## ✅ Success Indicators

### Backend is working if:

- [ ] Terminal shows: "🚀 Server running on port 5000"
- [ ] Terminal shows: "MongoDB connected"
- [ ] `curl http://localhost:5000/health` returns status OK
- [ ] No error messages in terminal

### Frontend is working if:

- [ ] Browser shows app at http://localhost:5173
- [ ] No red errors in browser console
- [ ] Can see landing page with role selection

### Integration is working if:

- [ ] Can register new user
- [ ] Receive OTP in terminal
- [ ] Can verify email
- [ ] Can login
- [ ] Can create trip
- [ ] Can see trip in history

---

## 🎯 Next Actions

### Immediate (Right Now)

1. ✅ Setup MongoDB
2. ✅ Setup email
3. ✅ Start backend `npm run dev`
4. ✅ Start frontend `npm run dev`
5. ✅ Test login flow in browser

### Soon (This Week)

1. 🔄 Test all endpoints
2. 🔄 Create demo data
3. 🔄 Test integration flows
4. 🔄 Fix any bugs

### Later (Next Steps)

1. 🚀 Setup Firebase realtime
2. 🚀 Deploy to cloud
3. 🚀 Setup CI/CD
4. 🚀 Performance testing

---

## 💡 Tips & Tricks

### Quick Test Script

```bash
# Test all endpoints at once
bash backend/test-api.sh
```

### Check Logs in Real-time

```bash
# Terminal showing logs
# Each request will show:
# [timestamp] METHOD /path/to/endpoint - STATUS_CODE
```

### View Database in GUI

```bash
# Install MongoDB Compass (GUI)
# Connect to MongoDB
# Browse collections visually
```

### Use Postman

```bash
# 1. Download Postman
# 2. Create requests from API_QUICK_REFERENCE.md
# 3. Test all endpoints
# 4. Export as collection
```

---

## 🚀 You're Ready!

**Your backend API is fully functional and ready to use!**

```
✅ 27 API endpoints
✅ JWT authentication
✅ MongoDB database
✅ Email OTP verification
✅ Frontend integration
✅ Comprehensive docs

Start with Step 1 above!
```

---

## 📚 Further Learning

Want to understand more? Read:

1. `API_QUICK_REFERENCE.md` - Learn all endpoints
2. `ARCHITECTURE.md` - Understand the system
3. `BACKEND_SETUP.md` - Deep dive guide
4. `FRONTEND_BACKEND_TESTING.md` - Integration testing

---

**Happy coding! 🎉**

If you get stuck, check:

- Error message in terminal
- Browser DevTools Console
- MongoDB data in mongosh
- API response in Network tab

**Questions?** Check the relevant documentation file listed above.
