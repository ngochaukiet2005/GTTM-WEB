# Backend API Setup & Testing Guide

## Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- npm

## Installation

1. Navigate to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```
PORT=5000
MONGO_URL=mongodb://localhost:27017/smart_shuttle
JWT_SECRET=your-super-secret-key-change-in-production-12345
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-67890
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## Running the Server

### Option 1: Development Mode (with Nodemon)

```bash
npm run dev
```

### Option 2: Production Mode

```bash
npm start
```

### Option 3: Using Docker/MongoDB Atlas

If you don't have MongoDB locally, use MongoDB Atlas (cloud):

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update MONGO_URL in .env

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/verify-email` - Verify email with OTP
- **POST** `/api/auth/resend-otp` - Resend OTP
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/forgot-password` - Forgot password
- **POST** `/api/auth/reset-password` - Reset password

### Passenger

- **GET** `/api/passenger/profile` - Get passenger profile
- **PATCH** `/api/passenger/profile` - Update passenger profile

### Trips (Passenger)

- **POST** `/api/trips` - Create new trip request
- **GET** `/api/trips` - Get all trips for passenger
- **GET** `/api/trips/:id` - Get specific trip

### Driver

- **GET** `/api/driver/trips` - Get all trips assigned to driver
- **GET** `/api/driver/trips/:id` - Get trip details
- **PATCH** `/api/driver/trips/:tripId/stop/:requestId` - Update stop status

## Testing Endpoints

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"passenger1@test.com",
    "password":"Password123!",
    "confirmPassword":"Password123!",
    "fullName":"John Doe",
    "numberPhone":"0987654321",
    "gender":"MALE",
    "role":"USER"
  }'
```

### 2. Verify Email (After Registration)

```bash
# First register, then check email/console for OTP
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"passenger1@test.com",
    "otp":"123456"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"passenger1@test.com",
    "password":"Password123!"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "passenger1@test.com",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

### 4. Create Trip Request (Passenger)

```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "ticketCode":"TICKET123",
    "pickupLocation":"123 Main St, City",
    "dropoffLocation":"456 Second Ave, City",
    "direction":"HOME_TO_STATION",
    "timeSlot":"2026-01-29T08:00:00Z"
  }'
```

### 5. Get All Trips (Passenger)

```bash
curl -X GET http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Get Driver Trips

```bash
# First register/login as DRIVER role
curl -X GET http://localhost:5000/api/driver/trips \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN"
```

## Database Schema

### User Collection

- \_id, fullName, email, numberPhone, gender, password, role, isVerified, refreshToken

### Passenger Collection

- \_id, userId, name, phone, createdAt, updatedAt

### Driver Collection

- \_id, userId, name, phone, vehicleId, capacity, status, createdAt, updatedAt

### ShuttleRequest Collection

- \_id, passengerId, ticketCode, direction, pickupLocation, dropoffLocation, timeSlot, status, tripId

### Trip Collection

- \_id, vehicleId, driverId, timeSlot, route (array with stops), status, createdAt, updatedAt

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas connection string

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Email Not Sending

- Check EMAIL_USER and EMAIL_PASS in .env
- Use Gmail app password, not regular password

### JWT Errors

- Make sure JWT_SECRET is set in .env
- Include "Bearer TOKEN" in Authorization header
