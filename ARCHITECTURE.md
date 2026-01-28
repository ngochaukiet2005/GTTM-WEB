# 🏗️ GTTM System Architecture

## 📐 Overall System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                      │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite + Tailwind)                             │
│  ├── Landing Page (role selection)                              │
│  ├── Passenger Module (booking, tracking, history)              │
│  ├── Driver Module (trips, status updates)                      │
│  └── Admin Module (dashboard, management)                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑
                    (HTTP/REST API)
                             ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Backend)                          │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express + JWT                                         │
│  ├── Auth Routes (register, login, verify, refresh)             │
│  ├── Passenger Routes (profile, trips, booking)                 │
│  ├── Driver Routes (assigned trips, status updates)             │
│  ├── Admin Routes (management, dispatch)                        │
│  └── Middleware (auth, error handling, CORS)                    │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑
                    (Database Driver)
                             ↓↑
┌─────────────────────────────────────────────────────────────────┐
│               DATA LAYER (MongoDB)                              │
├─────────────────────────────────────────────────────────────────┤
│  ├── Users Collection (auth, profiles)                          │
│  ├── Passengers Collection (extended profiles)                  │
│  ├── Drivers Collection (vehicle info, assignments)             │
│  ├── Trips Collection (routes, stops, status)                   │
│  └── ShuttleRequests Collection (bookings, queue)               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Architecture

```
┌─────────────────────────────────────────┐
│         User Registration Flow          │
└─────────────────────────────────────────┘
            ↓
   Frontend: POST /register
            ↓
Backend: Validate input → Hash password → Create User → Send OTP email
            ↓
   Frontend: POST /verify-email (with OTP)
            ↓
Backend: Verify OTP → Mark email verified
            ↓
        ✅ Ready to Login

┌─────────────────────────────────────────┐
│          User Login Flow                │
└─────────────────────────────────────────┘
            ↓
   Frontend: POST /login
            ↓
Backend: Find user → Verify password → Generate JWT tokens
            ↓
   Return: {accessToken (15m), refreshToken (7d)}
            ↓
Frontend: Store in localStorage → Include in API requests
            ↓
   Subsequent Requests: Authorization: Bearer <accessToken>
            ↓
Backend: Verify token → Check user → Allow/Deny access
            ↓
      If token expired: Use refreshToken → Get new accessToken
```

## 🚗 Trip Management Flow

```
┌──────────────────────────────────────────────────────┐
│         PASSENGER BOOKING A TRIP                     │
└──────────────────────────────────────────────────────┘

Passenger (Frontend)
  ↓
  1. Fill booking form
     - Ticket code
     - Pickup location
     - Dropoff location
     - Time slot
  ↓
  2. POST /trips (with accessToken)
  ↓
Backend
  ↓
  3. Validate request
  ↓
  4. Create ShuttleRequest document
     Status: "waiting"
  ↓
  5. Return tripId to frontend
  ↓
Passenger (Frontend)
  ↓
  6. Show confirmation & trip details
  ↓
  7. Can view in Trip History
  ↓
  8. Wait for assignment (admin/dispatcher)

┌──────────────────────────────────────────────────────┐
│        TRIP ASSIGNMENT & DISPATCH                    │
└──────────────────────────────────────────────────────┘

Admin/Dispatcher (Frontend)
  ↓
  1. POST /trip/dispatch
     - Collects pending requests
     - Groups by time slot & location
  ↓
Backend
  ↓
  2. Call RoutingService
     - Optimize routes
     - Calculate best order of stops
  ↓
  3. Create Trip document
     - Assign vehicle & driver
     - Set route with stops in order
  ↓
  4. Update ShuttleRequest
     Status: "assigned"
  ↓
Driver (Frontend)
  ↓
  5. GET /driver/trips
  ↓
  6. See assigned trip with stops
  ↓
  7. Start executing trip
     - PATCH /driver/trips/:tripId/stop/:stopId
     - Status: "picked_up"
     - Status: "dropped_off"
  ↓
Backend
  ↓
  8. Update Trip document
  ↓
  9. Update ShuttleRequest status
  ↓
  10. Auto-complete trip when all stops done
  ↓
Passenger (Frontend)
  ↓
  11. Trip History shows "Completed"
  ↓
  12. Can rate/review driver (future)
```

## 📊 Data Model Relationships

```
User (Base Model)
├─ Has ONE Passenger profile (via userId)
│  └─ Has MANY ShuttleRequests (via passengerId)
│     └─ Assigned to ONE Trip (via tripId)
│
└─ Has ONE Driver profile (via userId, if role=DRIVER)
   └─ Assigned MANY Trips (via driverId)
      └─ Contains MANY Stops (via Trip.route array)
         └─ References ShuttleRequest (via requestId)

Collections:
┌─────────────────┐
│  users          │
├─────────────────┤
│ _id             │
│ email           │
│ password        │
│ role (USER/...)│
│ isVerified      │
│ refreshToken    │
└─────────────────┘
       ↓
┌─────────────────┐     ┌──────────────────┐
│  passengers     │     │  drivers         │
├─────────────────┤     ├──────────────────┤
│ _id             │     │ _id              │
│ userId [ref]    │     │ userId [ref]     │
│ name            │     │ name             │
│ phone           │     │ vehicleId        │
└─────────────────┘     │ capacity         │
       ↓                │ status           │
┌──────────────────┐   └──────────────────┘
│  shuttle_        │          ↓
│  requests        │   ┌──────────────────┐
├──────────────────┤   │  trips           │
│ _id              │   ├──────────────────┤
│ passengerId [ref]│   │ _id              │
│ ticketCode       │   │ vehicleId        │
│ pickupLocation   │   │ driverId [ref]   │
│ dropoffLocation  │   │ route [ ]        │
│ timeSlot         │   │ status           │
│ status           │   └──────────────────┘
│ tripId [ref]     │
└──────────────────┘
```

## 🔌 API Endpoint Groups

```
Auth Endpoints (Public)
├── POST /auth/register
├── POST /auth/verify-email
├── POST /auth/login
├── POST /auth/refresh
├── POST /auth/forgot-password
└── POST /auth/reset-password

Protected Endpoints (Authenticated)
├── Passenger Routes (role: USER)
│  ├── POST /trips (create)
│  ├── GET /trips (list)
│  ├── GET /trips/:id (detail)
│  ├── GET /passenger/profile
│  └── PATCH /passenger/profile
│
├── Driver Routes (role: DRIVER)
│  ├── GET /driver/trips
│  ├── GET /driver/trips/:id
│  └── PATCH /driver/trips/:tripId/stop/:requestId
│
└── Admin Routes (role: ADMIN)
   ├── GET /trip/ (all)
   ├── GET /trip/:id
   ├── POST /trip/create
   ├── POST /trip/dispatch
   └── GET /shuttle-request/admin/pending
```

## 🔄 Request-Response Cycle

```
┌──────────────┐
│  Frontend    │
└──────────────┘
      ↓
      │ 1. User Action (click, form submit)
      ↓
  ┌─────────────────────────────────────┐
  │  Prepare Request                    │
  │  - Method: GET/POST/PATCH/DELETE    │
  │  - URL: /api/endpoint               │
  │  - Headers: Authorization: Bearer.. │
  │  - Body: JSON data (if applicable)  │
  └─────────────────────────────────────┘
      ↓
      │ 2. Send over HTTP
      ↓
  ┌──────────────────────────────────────┐
  │  Backend (Express Router)            │
  │  - Match route & method              │
  │  - Apply middlewares (auth, etc)     │
  │  - Call controller function          │
  └──────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────┐
  │  Controller                          │
  │  - Extract request data              │
  │  - Call service layer (business logic)
  │  - Format response                   │
  └──────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────┐
  │  Service                             │
  │  - Business logic                    │
  │  - Database operations (Mongoose)    │
  │  - External service calls            │
  └──────────────────────────────────────┘
      ↓
  ┌──────────────────────────────────────┐
  │  MongoDB                             │
  │  - Query/Insert/Update/Delete data   │
  │  - Return results                    │
  └──────────────────────────────────────┘
      ↓
      │ 3. Response flows back
      ↓
  ┌──────────────────────────────────────┐
  │  Backend Response                    │
  │  - Status code (200, 201, 400, 401..)│
  │  - JSON body                         │
  │  - Headers                           │
  └──────────────────────────────────────┘
      ↓
      │ 4. Send over HTTP
      ↓
  ┌──────────────────────────────────────┐
  │  Frontend (JavaScript)               │
  │  - Handle response                   │
  │  - Update UI state                   │
  │  - Show success/error message        │
  │  - Store tokens if auth response     │
  └──────────────────────────────────────┘
      ↓
┌──────────────┐
│  User Sees  │
│  Updated UI │
└──────────────┘
```

## 🔐 Security Layers

```
Request → CORS Check (Allowed domains)
        ↓
        → HTTP Method Validation
        ↓
        → Body Parsing & Content-Type Check
        ↓
        → Route Matching
        ↓
        → Authentication Middleware
        │ (Check Authorization header)
        │ (Verify JWT signature)
        │ (Check token expiration)
        ↓
        → Authorization Middleware (if needed)
        │ (Check user role: USER/DRIVER/ADMIN)
        ↓
        → Input Validation
        │ (Mongoose schema validation)
        │ (Field type checking)
        │ (Required fields check)
        ↓
        → Controller Logic
        ↓
        → Database Operations (with indexes)
        ↓
        → Response
        │ (Data sanitization)
        │ (Exclude passwords/sensitive data)
        │ (Standard response format)
        ↓
    Return to Client
```

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────┐
│  CloudFlare / CDN                   │
│  (Static assets, caching)           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Vercel / AWS S3 / Netlify         │
│  (Frontend deployment)              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Heroku / Railway / Fly.io         │
│  (Backend deployment)               │
│  - Node.js App Servers              │
│  - Load Balancing                   │
│  - Auto-scaling                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  MongoDB Atlas (Cloud)              │
│  - Replication                      │
│  - Backup                           │
│  - Monitoring                       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Firebase (Realtime Database)       │
│  - Driver tracking                  │
│  - Live notifications               │
│  - Presence detection               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  SendGrid / AWS SES                 │
│  (Email service)                    │
└─────────────────────────────────────┘
```

## 📱 Technology Stack

```
Frontend:
├── React 18.2 (UI library)
├── Vite (bundler)
├── React Router (navigation)
├── Tailwind CSS (styling)
├── Leaflet (mapping)
├── SweetAlert2 (alerts/modals)
└── Fetch API (HTTP client)

Backend:
├── Node.js (runtime)
├── Express 5 (web framework)
├── Mongoose (MongoDB ODM)
├── JWT (authentication)
├── Bcryptjs (password hashing)
├── Nodemailer (email)
├── Morgan (logging)
└── CORS (cross-origin)

Database:
├── MongoDB (main database)
├── Firebase (realtime, future)
└── Redis (caching, future)

DevOps:
├── Nodemon (dev auto-reload)
├── Git (version control)
├── Docker (containerization, future)
└── GitHub Actions (CI/CD, future)
```

## 📈 Scalability Considerations

```
Current Architecture:
- Single server instance
- Shared MongoDB database
- No caching layer
- No rate limiting

Future Improvements:
- Horizontal scaling (multiple server instances)
- Load balancer (Nginx, AWS ELB)
- Redis caching layer
- Database replication & sharding
- Rate limiting middleware
- CDN for static assets
- Message queue (Bull, RabbitMQ)
- API versioning
- Microservices (if needed)
```

---

**Version:** 1.0  
**Last Updated:** January 28, 2026
