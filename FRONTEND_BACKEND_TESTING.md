# 🔗 Frontend-Backend Integration Testing Guide

## ✅ Pre-requisites

- [ ] Backend servidor rodando: `npm run dev` (porta 5000)
- [ ] Frontend servidor rodando: `npm run dev` (porta 5173)
- [ ] MongoDB rodando (local ou Atlas)
- [ ] Todos os arquivos .env configurados

## 🎯 Testing Workflow

### Step 1: Verificar Backend está Online

```bash
# Em um terminal
cd backend
npm run dev
# Deve mostrar: "🚀 Server running on port 5000"
```

### Step 2: Testar Endpoint de Health Check

```bash
# Em outro terminal
curl http://localhost:5000/health
# Response: {"status":"ok","uptime":1.23...}
```

### Step 3: Iniciar Frontend

```bash
cd frontend
npm run dev
# Deve abrir http://localhost:5173
```

## 🧪 Integration Test Cases

### Test 1: Passenger Sign Up & Login

**Frontend Behavior:**

1. Abrir app em `http://localhost:5173`
2. Clicar em "Passenger" na landing page
3. Clicar em "Sign Up"
4. Preencher formulário:
   - Email: `test_passenger_1@example.com`
   - Senha: `Test123!Pass`
   - Nome: `Test Passenger`
   - Telefone: `0123456789`
5. Enviar formulário

**Expected Flow:**

```
Frontend → POST /api/auth/register
          ↓
Backend   → Create user record
          → Send OTP to email
          ↓
Frontend ← Response: { userId, message }
```

**Backend Verification:**

```bash
# Check MongoDB for new user
mongosh
> use smart_shuttle
> db.users.findOne({email: "test_passenger_1@example.com"})
# Should show new user document with isVerified: false
```

**Frontend Next Step:**

- App should show "Verify Email" screen
- Check console/terminal for OTP (in development mode)
- Enter OTP and verify

### Test 2: Login & Get Tokens

**Frontend:**

1. Após verificação de email, voltar para login
2. Email: `test_passenger_1@example.com`
3. Senha: `Test123!Pass`
4. Click "Login"

**Expected Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "507f...",
    "email": "test_passenger_1@example.com",
    "role": "USER"
  }
}
```

**Backend Verification:**

```bash
# Check if tokens are stored in frontend localStorage
# Open DevTools → Application → Local Storage
# Should have: authTokens with accessToken and refreshToken
```

### Test 3: Create Trip (Passenger)

**Frontend:**

1. Click "Book a Trip"
2. Preencher formulário:
   - Ticket Code: `TICKET001`
   - Pickup: `123 Main St, City`
   - Dropoff: `456 School Ave, City`
   - Direction: `HOME_TO_STATION`
   - Time: `2026-01-29 08:00 AM`
3. Submit

**API Request (Frontend deve fazer):**

```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "ticketCode": "TICKET001",
    "pickupLocation": "123 Main St, City",
    "dropoffLocation": "456 School Ave, City",
    "direction": "HOME_TO_STATION",
    "timeSlot": "2026-01-29T08:00:00Z"
  }'
```

**Expected Response:**

```json
{
  "status": "success",
  "message": "Trip request created successfully",
  "data": {
    "tripId": "507f...",
    "status": "waiting"
  }
}
```

**Frontend Should:**

- Show success message
- Update trip history list
- Display trip details

### Test 4: View Trip History

**Frontend:**

1. Click "Trip History"
2. Should show all passenger's trips

**API Called (behind scenes):**

```
GET /api/trips
Authorization: Bearer <accessToken>
```

**Backend Returns:**

```json
{
  "status": "success",
  "results": 1,
  "data": {
    "trips": [
      {
        "id": "507f...",
        "ticketCode": "TICKET001",
        "status": "waiting",
        "pickupLocation": "123 Main St, City"
      }
    ]
  }
}
```

### Test 5: Driver Login & View Trips

**Setup: Register Driver First**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Driver",
    "email": "test_driver_1@example.com",
    "numberPhone": "0987654321",
    "password": "Driver123!",
    "confirmPassword": "Driver123!",
    "gender": "MALE",
    "role": "DRIVER"
  }'
```

**Frontend:**

1. Verify driver email (check OTP in logs)
2. Login as driver
3. Should see empty trip list initially

**Backend Verification:**

```bash
# Create trip manually and assign to driver
mongosh
> use smart_shuttle
> db.trips.insertOne({
    vehicleId: "VEH-001",
    driverId: ObjectId("..."),
    timeSlot: new Date(),
    route: [...],
    status: "ready"
  })
```

**After Manual Trip Creation:**

- Driver refreshes page
- Should see trip in list
- Click trip to see stops/locations

### Test 6: Driver Update Stop Status

**Frontend:**

1. Driver clicks on a trip
2. See list of stops (pickups/dropoffs)
3. Mark "John's House" as "Picked Up"
4. Mark "School" as "Dropped Off"

**API Request:**

```bash
curl -X PATCH http://localhost:5000/api/driver/trips/507f.../stop/507f... \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <driverToken>" \
  -d '{"status": "picked_up"}'
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "trip": {
      "status": "running",
      "route": [
        {
          "status": "picked_up"
        }
      ]
    }
  }
}
```

## 🔍 Debugging

### Browser DevTools

**Check Network Tab:**

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (login, create trip, etc)
4. Look for API requests
5. Check response and status codes

**Check Console:**

- Look for error messages
- Check if tokens are being sent
- Verify API responses

**Check Application/Storage:**

- Local Storage → authTokens
- Should have accessToken and refreshToken

### Backend Logs

**Terminal where backend is running:**

```
[nodemon] restarting due to changes...
MongoDB connected
POST /api/auth/login - 200
GET /api/trips - 200
POST /api/trips - 201
```

### MongoDB Verification

```bash
mongosh
> use smart_shuttle
> db.users.find()          # Check users
> db.passengers.find()     # Check passengers
> db.shuttlerequests.find() # Check trip requests
> db.trips.find()          # Check trips
```

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error

```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solution:**

- Check backend index.js has `cors()` middleware
- Verify CORS is configured before routes
- Restart backend server

### Issue 2: 401 Unauthorized

```json
{ "message": "You are not logged in! Please log in to get access." }
```

**Solution:**

- Ensure token is in Authorization header
- Format: `Bearer <token>` (with space)
- Check token hasn't expired (15 min)
- Try refreshing token with refreshToken

### Issue 3: Token Not Storing in Frontend

```javascript
// In browser DevTools Console:
localStorage.getItem("authTokens");
// Returns: null
```

**Solution:**

- Check if login response has accessToken/refreshToken
- Verify apiClient.js `storeTokens()` is being called
- Check localStorage isn't cleared

### Issue 4: MongoDB Connection Error

```
MongoDB connection failed Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- Start MongoDB: `mongod`
- Or use MongoDB Atlas and update MONGO_URL
- Check .env has correct MONGO_URL

### Issue 5: OTP Not Sending

```
Email send failed: Error: Invalid login
```

**Solution:**

- Check EMAIL_USER is Gmail address
- Use Gmail App Password (not regular password)
- Enable 2FA on Google account
- Verify SMTP settings in email.service.js

## 📋 Test Checklist

### Auth Flow

- [ ] Register passenger
- [ ] Verify email with OTP
- [ ] Login passenger
- [ ] Access token is valid
- [ ] Can refresh token
- [ ] Logout works
- [ ] Change password works
- [ ] Forgot password/reset works

### Passenger Features

- [ ] View profile
- [ ] Update profile
- [ ] Create trip request
- [ ] View trip history (active)
- [ ] View trip history (completed)
- [ ] Cancel trip request
- [ ] Verify ticket code

### Driver Features

- [ ] Register as driver
- [ ] Login as driver
- [ ] View assigned trips
- [ ] View trip details
- [ ] Update pickup status
- [ ] Update dropoff status
- [ ] Mark no-show

### Admin Features

- [ ] View all trips
- [ ] View pending requests
- [ ] Create trip manually
- [ ] Auto-dispatch trips

## 📊 Performance Checklist

- [ ] Requests complete in < 1 second
- [ ] No console errors
- [ ] No memory leaks
- [ ] Tokens refresh automatically
- [ ] Error messages are clear
- [ ] Loading states show properly

## 🎉 Success Criteria

✅ All tests pass  
✅ No console errors  
✅ No CORS issues  
✅ Tokens work correctly  
✅ Data persists in MongoDB  
✅ Frontend displays data correctly

## 📝 After Testing

1. Document any bugs found
2. Create issues if needed
3. Note performance metrics
4. Prepare for next phase (Firebase realtime)

---

**Next Phase:** Firebase Integration for real-time driver tracking
