# Smart Shuttle Dispatch System - Backend API

## 📋 Overview

Complete Node.js/Express backend API for the Smart Shuttle shuttle dispatch system with JWT authentication, MongoDB database, and real-time trip management.

## ✨ Features Implemented

### ✅ Authentication (100%)

- User registration with email verification
- JWT-based authentication (access + refresh tokens)
- OTP verification via email
- Password reset functionality
- Role-based access control (USER, DRIVER, ADMIN)

### ✅ Passenger Features (90%)

- Create trip requests
- View trip history and status
- Update passenger profile
- Track assigned vehicle and driver

### ✅ Driver Features (85%)

- Retrieve assigned trips
- Update trip stop status (pickup, dropoff, no-show)
- View route and vehicle assignments

### ✅ Trip Management (80%)

- Create optimized trips from multiple bookings
- Dispatch trips with routing optimization
- Update trip and stop status
- Real-time trip status tracking

### ✅ Admin Features (60%)

- View pending shuttle requests
- Monitor all trips
- Manage drivers and passengers

## 📁 Project Structure

```
backend/
├── src/
│   ├── configs/           # Configuration files
│   │   ├── database.js    # MongoDB connection
│   │   ├── env.js         # Environment variables
│   │   └── firebase.js    # Firebase config
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.js
│   │   ├── passenger.controller.js
│   │   ├── shuttleRequest.controller.js
│   │   └── tripController.js
│   ├── models/           # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── passenger.model.js
│   │   ├── driver.model.js
│   │   ├── trip.model.js
│   │   └── shuttleRequest.model.js
│   ├── routes/           # API routes
│   │   ├── auth.route.js
│   │   ├── passenger.route.js
│   │   ├── driver.route.js
│   │   ├── trips.route.js
│   │   ├── trip.route.js
│   │   ├── ticket.route.js
│   │   └── index.route.js
│   ├── services/         # Business logic
│   │   ├── auth.service.js
│   │   ├── dispatch.service.js
│   │   ├── email.service.js
│   │   ├── firebaseService.js
│   │   └── routingService.js
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.js
│   │   └── errorHandle.middleware.js
│   ├── utils/            # Utility functions
│   │   ├── appError.js
│   │   ├── asyncHandle.js
│   │   ├── hash.js       # Bcrypt hashing
│   │   ├── jwt.js        # JWT generation/verification
│   │   └── otp.js        # OTP generation
│   └── index.js          # Server entry point
├── scripts/
│   └── seedDemo.js       # Database seeding script
├── .env                  # Environment variables
├── package.json
└── BACKEND_SETUP.md      # Setup guide
```

## 🚀 API Routes Summary

### Authentication Endpoints

```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login user
POST   /api/auth/verify-email       - Verify email with OTP
POST   /api/auth/resend-otp         - Resend OTP
POST   /api/auth/refresh            - Refresh access token
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password with OTP
POST   /api/auth/logout             - Logout user
POST   /api/auth/change-password    - Change password (authenticated)
```

### Passenger Endpoints

```
GET    /api/passenger/profile       - Get passenger profile
PATCH  /api/passenger/profile       - Update passenger profile
POST   /api/passenger/verify-ticket - Verify ticket code
```

### Trip Endpoints (Passenger)

```
POST   /api/trips                   - Create new trip request
GET    /api/trips                   - Get all passenger trips
GET    /api/trips/:id               - Get specific trip details
```

### Driver Endpoints

```
GET    /api/driver/trips            - Get assigned trips for driver
GET    /api/driver/trips/:id        - Get trip details
PATCH  /api/driver/trips/:tripId/stop/:requestId  - Update stop status
```

### Shuttle Request Endpoints

```
POST   /api/shuttle-request/request         - Create shuttle request
GET    /api/shuttle-request/status          - Get request status
PATCH  /api/shuttle-request/:id/cancel      - Cancel request
GET    /api/shuttle-request/admin/pending   - Get pending requests (admin)
```

### Trip Management Endpoints

```
GET    /api/trip/                   - Get all trips
GET    /api/trip/:id                - Get trip by ID
POST   /api/trip/create             - Create new trip (admin/dispatcher)
POST   /api/trip/dispatch           - Auto-dispatch trips
PATCH  /api/trip/stop-status        - Update stop status
```

## 🔐 Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <access_token>
```

### Token Expiration

- Access Token: 15 minutes
- Refresh Token: 7 days

## 📊 Database Models

### User

- Basic user information
- Authentication credentials
- Role-based access (USER, DRIVER, ADMIN)
- Email verification status

### Passenger

- Extended passenger profile
- Links to User
- Phone and name information

### Driver

- Driver profile information
- Vehicle assignment
- Capacity management
- Status tracking (active, inactive, on_trip)

### Trip

- Multiple stops/routes
- Vehicle and driver assignment
- Route optimization
- Status tracking (ready, running, completed)

### ShuttleRequest

- Passenger booking information
- Pickup/dropoff locations
- Time slot
- Status tracking (waiting, assigned, running, completed)

## 🔄 Authentication Flow

1. **Register** → User creates account with email
2. **Verify Email** → User enters OTP sent to email
3. **Login** → User provides credentials → Get JWT tokens
4. **Use Token** → Include access token in requests
5. **Refresh** → When token expires, use refresh token to get new access token

## 🛠️ Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/smart_shuttle

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=your-api-key-here
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - CORS middleware
- **morgan** - Request logging
- **nodemailer** - Email sending
- **dotenv** - Environment variables
- **axios** - HTTP client
- **firebase-admin** - Firebase integration

## 🧪 Testing

### Quick Start Test

```bash
# 1. Start server
npm run dev

# 2. In another terminal, test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!",
    "confirmPassword":"Test123!",
    "fullName":"Test User",
    "numberPhone":"0987654321"
  }'

# 3. Verify email (check console for OTP)
# 4. Login to get tokens
# 5. Use tokens to access protected routes
```

For detailed testing guide, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)

## 🚦 Status Tracking

### Trip Status Flow

```
ready → running → completed
```

### Shuttle Request Status Flow

```
waiting → assigned → running → completed
```

### Stop Status in Trip

```
pending → picked_up → dropped_off
          (or no_show)
```

## 📝 Error Handling

All errors return standard format:

```json
{
  "message": "Error description",
  "statusCode": 400
}
```

Common errors:

- `400` - Bad request / validation error
- `401` - Unauthorized / invalid token
- `403` - Forbidden / insufficient permissions
- `404` - Resource not found
- `500` - Server error

## 🔄 Integration with Frontend

Frontend can use these endpoints:

### Sign Up

```javascript
const response = await fetch("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
    fullName,
    numberPhone,
    gender,
  }),
});
```

### Login

```javascript
const response = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const { accessToken, refreshToken } = await response.json();
```

### Create Trip

```javascript
const response = await fetch("/api/trips", {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({
    ticketCode,
    pickupLocation,
    dropoffLocation,
    direction,
    timeSlot,
  }),
});
```

### Get Driver Trips

```javascript
const response = await fetch("/api/driver/trips", {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

## 📚 Documentation

- See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed setup and testing
- See [docs/API_Spec.md](../docs/API_Spec.md) for API specifications

## ✅ Completion Checklist

- [x] User authentication (register, login, verify email)
- [x] JWT token generation and verification
- [x] Password reset with OTP
- [x] Passenger profile management
- [x] Trip request creation
- [x] Trip list and details retrieval
- [x] Driver trip assignment
- [x] Stop status updates
- [x] Role-based access control
- [x] Error handling middleware
- [x] Email sending service
- [ ] Firebase realtime tracking (next phase)
- [ ] Admin dashboard endpoints (partially done)
- [ ] Payment integration (future)

## 🎯 Next Steps

1. **Test all endpoints** - Use Postman or curl
2. **Connect Frontend** - Update apiClient.js to use real endpoints
3. **Add Firebase** - Implement realtime driver tracking
4. **Deploy** - Use Docker or cloud services

---

**Last Updated:** January 28, 2026
