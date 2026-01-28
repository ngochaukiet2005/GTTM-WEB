# 🚀 Smart Shuttle Dispatch System (GTTM-WEB)

**Status:** Backend API ✅ Complete | Frontend UI ✅ 55% Complete | Realtime Tracking ⏳ Next Phase

---

## 📖 Project Overview

Smart Shuttle Dispatch System là một ứng dụng web toàn diện để quản lý dịch vụ xe shuttle với:

- 👤 **Hành khách (Passengers)** - Đặt chuyến, theo dõi xe
- 🚗 **Tài xế (Drivers)** - Nhận chuyến, cập nhật trạng thái
- 👨‍💼 **Quản trị viên (Admins)** - Quản lý hệ thống, điều phối chuyến

---

## 📂 Project Structure

```
GTTM-WEB/
├── 📁 frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── features/              # Passenger, Driver, Admin pages
│   │   ├── core/                  # API client, services
│   │   └── App.jsx                # Main routing
│   └── package.json
│
├── 📁 backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── routes/                # API endpoints
│   │   ├── controllers/           # Request handlers
│   │   ├── models/                # MongoDB schemas
│   │   ├── services/              # Business logic
│   │   ├── middlewares/           # Auth, error handling
│   │   └── utils/                 # JWT, OTP, Hash
│   ├── .env                       # Configuration
│   └── package.json
│
├── 📁 docs/                       # Project documentation
├── 📁 deployment/                 # Deployment configs
│
├── 📄 README.md                   # This file
├── 📄 QUICK_START.md              # Quick start guide (5 minutes)
├── 📄 API_QUICK_REFERENCE.md      # All API endpoints
├── 📄 ARCHITECTURE.md             # System design
├── 📄 BACKEND_IMPLEMENTATION.md   # What was built
├── 📄 FRONTEND_BACKEND_TESTING.md # Integration testing
├── 📄 COMPLETION_REPORT.md        # Implementation report
├── 📄 SUMMARY_VI.md               # Vietnamese summary
└── 📄 FILES_SUMMARY.md            # List of all files
```

---

## 🎯 Current Progress

### ✅ Completed (Backend API)

**Backend API:** 100%

- 27 API endpoints
- JWT authentication
- MongoDB database
- Email OTP verification
- Role-based access control
- Error handling
- Comprehensive documentation

**Frontend UI:** 55%

- Landing page
- Authentication screens (all roles)
- Passenger module (booking, history, profile)
- Driver module (trips, history)
- Admin module (partial)
- Leaflet map integration

### ⏳ Next Phases

**Phase 2 (Firebase Realtime)**

- Driver location tracking
- Real-time trip updates
- Push notifications

**Phase 3 (Additional Features)**

- Google Maps Directions
- Payment integration
- Rating/review system
- Admin analytics

---

## 🚀 Quick Start

### ⏱️ 5 Minutes to Get Started

1. **Start MongoDB**

```bash
mongod  # or use MongoDB Atlas
```

2. **Setup Gmail (for OTP)**

```
Gmail App Password → EMAIL_PASS in backend/.env
```

3. **Start Backend**

```bash
cd backend
npm install
npm run dev
```

4. **Start Frontend** (Another terminal)

```bash
cd frontend
npm install
npm run dev
```

5. **Test**

```
Open http://localhost:5173
Register → Verify → Login → Create Trip
```

👉 **Detailed guide:** Read [QUICK_START.md](QUICK_START.md)

---

## 🔐 Authentication

### User Roles

```
USER (Passenger)
├── Create trip requests
├── View own trips
└── Update profile

DRIVER
├── View assigned trips
├── Update stop status
└── Update profile

ADMIN
├── View all trips
├── Manage dispatch
└── System management
```

### JWT Flow

```
1. Register → Get userId
2. Verify Email → OTP validation
3. Login → Get accessToken (15m) + refreshToken (7d)
4. Use accessToken in Authorization header
5. Token expires → Use refreshToken to refresh
```

---

## 📊 API Endpoints (27 Total)

### Authentication (9)

```
POST   /api/auth/register
POST   /api/auth/verify-email
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
POST   /api/auth/resend-otp
```

### Passenger (5)

```
GET    /api/passenger/profile
PATCH  /api/passenger/profile
POST   /api/trips
GET    /api/trips
GET    /api/trips/:id
```

### Driver (3)

```
GET    /api/driver/trips
GET    /api/driver/trips/:id
PATCH  /api/driver/trips/:tripId/stop/:requestId
```

### Shuttle Request (4)

```
POST   /api/shuttle-request/request
GET    /api/shuttle-request/status
PATCH  /api/shuttle-request/:id/cancel
GET    /api/shuttle-request/admin/pending
```

### Trip Management (6)

```
GET    /api/trip/
GET    /api/trip/:id
POST   /api/trip/create
POST   /api/trip/dispatch
PATCH  /api/trip/stop-status
```

👉 **Full reference:** See [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)

---

## 💾 Database Schema

### Collections

```
users
├─ email, password, fullName, numberPhone
├─ role (USER, DRIVER, ADMIN), isVerified
└─ refreshToken

passengers
├─ userId (ref to User)
├─ name, phone

drivers
├─ userId (ref to User)
├─ vehicleId, capacity, status

trips
├─ vehicleId, driverId
├─ route (array of stops)
└─ status (ready, running, completed)

shuttle_requests
├─ passengerId, ticketCode
├─ pickupLocation, dropoffLocation
├─ timeSlot, status, tripId
```

---

## 🔗 Frontend Integration

### Using the API

```javascript
import { apiClient, getStoredTokens } from "./core/apiClient";

// Login
const response = await apiClient.login({
  identifier: "user@example.com",
  password: "password123",
});

// Create trip
const trip = await apiClient.createTrip({
  ticketCode: "TICKET001",
  pickupLocation: "Home",
  dropoffLocation: "School",
  direction: "HOME_TO_STATION",
  timeSlot: "2026-01-29T08:00:00Z",
  token: accessToken,
});

// Get trips
const trips = await apiClient.getPassengerTrips(accessToken);
```

---

## 🧪 Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com",...}'

# More examples in API_QUICK_REFERENCE.md
```

### Integration Testing

See [FRONTEND_BACKEND_TESTING.md](FRONTEND_BACKEND_TESTING.md) for:

- Complete test scenarios
- Expected responses
- Debugging tips

---

## 📚 Documentation

| Document                        | Purpose                         |
| ------------------------------- | ------------------------------- |
| **QUICK_START.md**              | Get up and running in 5 minutes |
| **API_QUICK_REFERENCE.md**      | All endpoints with examples     |
| **ARCHITECTURE.md**             | System design & diagrams        |
| **backend/README.md**           | Backend features & structure    |
| **backend/BACKEND_SETUP.md**    | Detailed setup guide            |
| **FRONTEND_BACKEND_TESTING.md** | Integration testing guide       |
| **COMPLETION_REPORT.md**        | What was implemented            |
| **SUMMARY_VI.md**               | Vietnamese summary              |

---

## ✨ Key Features

### ✅ Implemented

- User authentication with JWT
- Email OTP verification
- Trip booking and management
- Driver assignment
- Trip status tracking
- Profile management
- Password reset
- Role-based access control
- MongoDB persistence
- Error handling

### ⏳ Coming Soon

- Firebase realtime tracking
- Google Maps directions
- Push notifications
- Payment integration
- Rating system
- Advanced analytics

---

## 🛠️ Tech Stack

### Frontend

- React 18.2 (UI)
- Vite (Bundler)
- React Router (Navigation)
- Tailwind CSS (Styling)
- Leaflet (Mapping)
- SweetAlert2 (Alerts)

### Backend

- Node.js (Runtime)
- Express 5 (Framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- Bcryptjs (Password hashing)
- Nodemailer (Email)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v14+
- MongoDB (local or Atlas)
- Gmail account (for OTP)

### Installation

**Step 1: Clone & Navigate**

```bash
cd GTTM-WEB
```

**Step 2: Setup Backend**

```bash
cd backend
npm install
# Configure .env (MongoDB, JWT, Email)
npm run dev
```

**Step 3: Setup Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Step 4: Test**

```
Open http://localhost:5173
```

👉 Detailed: [QUICK_START.md](QUICK_START.md)

---

## 📞 Troubleshooting

### MongoDB Connection Failed

- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud service
- Update MONGO_URL in .env

### Email Not Sending

- Setup Gmail App Password
- Enable 2FA on Google account
- Verify EMAIL_USER and EMAIL_PASS in .env

### Port Already in Use

```bash
lsof -i :5000
kill -9 <PID>
```

### More Help

Check [BACKEND_SETUP.md](backend/BACKEND_SETUP.md) troubleshooting section

---

## 📊 Progress Summary

```
┌──────────────────────────────────────────┐
│        Project Completion Status         │
├──────────────────────────────────────────┤
│ Frontend UI            ████░░░░░░░░  55% │
│ Backend API            ████████████ 100% │
│ Database               ████████████ 100% │
│ Documentation          ████████████ 100% │
│ Authentication         ████████████ 100% │
│ Realtime Tracking      ░░░░░░░░░░░░   0% │
│ Payment                ░░░░░░░░░░░░   0% │
│                                          │
│ Overall Project        ████████░░░░  65% │
└──────────────────────────────────────────┘
```

---

## 🎯 Roadmap

### Week 1 ✅ (Current)

- [x] Backend API complete
- [x] Database setup
- [x] Authentication
- [ ] Integration testing

### Week 2-3 (Next)

- [ ] Firebase realtime tracking
- [ ] Complete admin dashboard
- [ ] Advanced trip filtering

### Week 4-5

- [ ] Google Maps integration
- [ ] Payment system
- [ ] Rating/review

### Week 6+

- [ ] Deployment
- [ ] Performance optimization
- [ ] Mobile app

---

## 📝 Contributing

To contribute:

1. Create a branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with expiration
- OTP verification for registration
- Role-based access control
- Input validation
- Error handling without exposing internals

---

## 📄 License

This project is proprietary.

---

## 👥 Team

- Backend Developer: Built complete API
- Frontend Developer: UI implementation in progress
- DevOps: Deployment (future)

---

## 📞 Contact & Support

For issues or questions:

1. Check documentation files
2. Review troubleshooting section
3. Check backend logs
4. Check browser DevTools

---

## ✨ Highlights

🎉 **What Makes This Special:**

- Complete API with 27 endpoints
- JWT + OTP security
- Real database integration
- Comprehensive documentation
- Frontend already partially built
- Ready for realtime features

---

**Last Updated:** January 28, 2026  
**Version:** 1.0.0  
**Status:** ✅ Backend Complete, Ready for Testing

👉 **Start Here:** [QUICK_START.md](QUICK_START.md)
