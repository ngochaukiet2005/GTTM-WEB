# 🚀 GTTM Backend API - Quick Reference Guide

## 📱 API Base URL

```
http://localhost:5000/api
```

## 🔐 Authentication Flow

```
1. Register (POST /auth/register)
   ↓
2. Verify Email (POST /auth/verify-email) - Need OTP from email
   ↓
3. Login (POST /auth/login) - Get accessToken & refreshToken
   ↓
4. Use accessToken in Authorization header for all requests
   ↓
5. If token expires, use refreshToken (POST /auth/refresh)
```

## 👥 User Roles & Access

| Role             | Can Access                                      | Cannot Access             |
| ---------------- | ----------------------------------------------- | ------------------------- |
| USER (Passenger) | `/passenger/*`, `/trips*`, `/shuttle-request/*` | `/driver/*`, `/trip/*`    |
| DRIVER           | `/driver/*`, `/trips/:id`, `/passenger/profile` | `/passenger/*`, `/trip/*` |
| ADMIN            | All endpoints                                   | -                         |

## 📌 Endpoint Cheat Sheet

### Auth Endpoints

```
POST   /auth/register              Login não necessário
POST   /auth/verify-email          Após register
POST   /auth/login                 Sem token
POST   /auth/refresh               Use refreshToken
POST   /auth/logout                Requer token
POST   /auth/forgot-password       Sem token
POST   /auth/reset-password        Com OTP do email
POST   /auth/change-password       Requer token
```

### Passenger Endpoints

```
GET    /passenger/profile          Listar perfil
PATCH  /passenger/profile          Atualizar perfil
POST   /passenger/verify-ticket    Verificar ticket

POST   /trips                       Criar viagem
GET    /trips                       Listar viagens
GET    /trips/:id                   Detalhes da viagem
PATCH  /shuttle-request/:id/cancel  Cancelar solicitação
```

### Driver Endpoints

```
GET    /driver/trips               Listar viagens (do driver logado)
GET    /driver/trips/:id           Detalhes da viagem
PATCH  /driver/trips/:tripId/stop/:requestId  Atualizar parada
```

### Admin Endpoints

```
GET    /trip/                      Todas as viagens
GET    /trip/:id                   Detalhes da viagem
POST   /trip/create                Criar viagem manualmente
POST   /trip/dispatch              Auto-dispatch viagens
GET    /shuttle-request/admin/pending  Solicitações pendentes
```

## 🔑 Authentication Header

All authenticated requests need:

```
Authorization: Bearer <accessToken>
```

Example:

```bash
curl -H "Authorization: Bearer eyJhbGci..." http://localhost:5000/api/trips
```

## 📝 Common Request/Response Examples

### 1. Register

**Request:**

```json
POST /auth/register
{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "numberPhone": "0987654321",
  "password": "Senha123!",
  "confirmPassword": "Senha123!",
  "gender": "MALE",
  "role": "USER"
}
```

**Response (201):**

```json
{
  "message": "User registered. Please verify your email with the OTP sent.",
  "userId": "507f1f77bcf86cd799439011"
}
```

### 2. Login

**Request:**

```json
POST /auth/login
{
  "email": "joao@example.com",
  "password": "Senha123!"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "joao@example.com",
    "fullName": "João Silva",
    "numberPhone": "0987654321",
    "role": "USER"
  }
}
```

### 3. Create Trip Request

**Request:**

```json
POST /trips
Authorization: Bearer <accessToken>
{
  "ticketCode": "TICKET123456",
  "pickupLocation": "123 Main Street, City",
  "dropoffLocation": "456 School Ave, City",
  "direction": "HOME_TO_STATION",
  "timeSlot": "2026-01-29T08:00:00Z"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Trip request created successfully",
  "data": {
    "tripId": "507f1f77bcf86cd799439012",
    "status": "waiting",
    "pickupLocation": "123 Main Street, City",
    "dropoffLocation": "456 School Ave, City",
    "timeSlot": "2026-01-29T08:00:00Z"
  }
}
```

### 4. Get Passenger Trips

**Request:**

```
GET /trips
Authorization: Bearer <accessToken>
```

**Response (200):**

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "trips": [
      {
        "id": "507f1f77bcf86cd799439012",
        "ticketCode": "TICKET123456",
        "status": "waiting",
        "direction": "HOME_TO_STATION",
        "pickupLocation": "123 Main Street, City",
        "dropoffLocation": "456 School Ave, City",
        "timeSlot": "2026-01-29T08:00:00Z",
        "tripInfo": null
      }
    ]
  }
}
```

### 5. Get Driver Trips

**Request:**

```
GET /driver/trips
Authorization: Bearer <driverAccessToken>
```

**Response (200):**

```json
{
  "status": "success",
  "results": 1,
  "data": {
    "trips": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "vehicleId": "VEH-001",
        "driverId": "507f1f77bcf86cd799439030",
        "timeSlot": "2026-01-29T08:00:00Z",
        "route": [
          {
            "_id": "507f1f77bcf86cd799439021",
            "requestId": "507f1f77bcf86cd799439012",
            "location": "123 Main Street, City",
            "type": "pickup",
            "order": 1,
            "status": "pending"
          }
        ],
        "status": "ready"
      }
    ]
  }
}
```

### 6. Update Stop Status (Driver)

**Request:**

```json
PATCH /driver/trips/507f1f77bcf86cd799439020/stop/507f1f77bcf86cd799439012
Authorization: Bearer <driverAccessToken>
{
  "status": "picked_up"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "trip": {
      "_id": "507f1f77bcf86cd799439020",
      "vehicleId": "VEH-001",
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

## ❌ Common Errors

| Error            | Cause                    | Fix                          |
| ---------------- | ------------------------ | ---------------------------- |
| 400 Bad Request  | Missing required fields  | Check request body           |
| 401 Unauthorized | Invalid/expired token    | Login again or refresh token |
| 403 Forbidden    | Insufficient permissions | Use correct role/token       |
| 404 Not Found    | Resource doesn't exist   | Check ID/endpoint            |
| 500 Server Error | MongoDB/service issue    | Check server logs            |

## 🧪 Testing Tools

### Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Using Postman

1. Create new request
2. Set method to POST
3. Enter URL: `http://localhost:5000/api/auth/login`
4. Go to Body tab
5. Select "raw" and "JSON"
6. Paste JSON data
7. Click Send

### Using Thunder Client (VS Code)

1. Install "Thunder Client" extension
2. New request
3. Paste URL and method
4. Add body and headers
5. Send

## 🔄 Token Refresh Flow

```javascript
// When access token expires (401 response)
const refreshTokens = async () => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken: localStorage.getItem("refreshToken"),
    }),
  });

  const { accessToken, refreshToken } = await response.json();
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};
```

## 📊 Database Status

| Collection       | Status | Records |
| ---------------- | ------ | ------- |
| users            | Ready  | 0+      |
| passengers       | Ready  | 0+      |
| drivers          | Ready  | 0+      |
| trips            | Ready  | 0+      |
| shuttle_requests | Ready  | 0+      |

## 🚨 Before Going Live

- [ ] Change JWT_SECRET in .env
- [ ] Change JWT_REFRESH_SECRET in .env
- [ ] Configure real MongoDB (Atlas or self-hosted)
- [ ] Setup Gmail App Password for OTP
- [ ] Test all endpoints with real data
- [ ] Setup CORS for frontend domain
- [ ] Enable HTTPS
- [ ] Setup rate limiting
- [ ] Add request validation
- [ ] Setup error logging (Sentry/LogRocket)

## 📞 Support

For issues:

1. Check [BACKEND_SETUP.md](../backend/BACKEND_SETUP.md) for detailed guide
2. Check server logs: `npm run dev`
3. Verify MongoDB connection
4. Ensure .env has correct values
5. Check API response messages

---

**Version:** 1.0.0  
**Last Updated:** January 28, 2026  
**Status:** Ready for Production
