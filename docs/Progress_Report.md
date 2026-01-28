# Project Progress Report — GTTM-WEB (2026-01-28)

## Overall Summary

- Estimated completion: **35%**
- Frontend (UI/flows): **~55%** complete
- Backend (API, DB, auth): **0%** implemented
- Realtime tracking (Firebase): **0%** implemented

This estimate is based on the documented scope in `docs/Demo_Guide.md` and `docs/API_Spec.md`, compared to the current implemented code in `frontend/src/**` and `backend/**`.

## Scope Reference

- Must-have features from SRS (`docs/Demo_Guide.md`):
  - Auth with JWT and role-based access
  - Passenger: map, select pickup/drop, book trip, track vehicle realtime
  - Driver: receive trips, overview route, Google Maps navigation, update trip status
  - System: auto vehicle assignment, realtime position sync, ETA estimation
- API spec (`docs/API_Spec.md`): auth login, passenger trip CRUD, driver trip list/status update.

## Frontend Status

### Implemented (UI / Mock)

- Landing & role selection: [frontend/src/features/LandingPage.jsx](../../frontend/src/features/LandingPage.jsx)
- Auth screens (UI):
  - Passenger: [frontend/src/features/passenger/PassengerAuth.jsx](../../frontend/src/features/passenger/PassengerAuth.jsx), form: [frontend/src/features/auth/AuthForm.jsx](../../frontend/src/features/auth/AuthForm.jsx), layout: [frontend/src/features/auth/AuthLayout.jsx](../../frontend/src/features/auth/AuthLayout.jsx)
  - Driver: [frontend/src/features/driver/DriverAuth.jsx](../../frontend/src/features/driver/DriverAuth.jsx)
  - Admin: [frontend/src/features/admin/AdminAuth.jsx](../../frontend/src/features/admin/AdminAuth.jsx)
- Map + GPS + point selection (Passenger):
  - Page: [frontend/src/features/passenger/PassengerHome.jsx](../../frontend/src/features/passenger/PassengerHome.jsx)
  - Map component (Leaflet): [frontend/src/features/map/AppMap.jsx](../../frontend/src/features/map/AppMap.jsx)
- Mock services:
  - Passenger: [frontend/src/core/services/mockApiPassenger.js](../../frontend/src/core/services/mockApiPassenger.js)
  - Driver: [frontend/src/core/services/mockApiDriver.js](../../frontend/src/core/services/mockApiDriver.js)
  - Admin: [frontend/src/core/services/mockApiAdmin.js](../../frontend/src/core/services/mockApiAdmin.js)

### Partially Implemented / In Progress

- Booking flow (Passenger) using mock service (`createTrip`) but no real API.
- Admin dashboard component exists: [frontend/src/features/admin/AdminDashboard.jsx](../../frontend/src/features/admin/AdminDashboard.jsx), but no route wired in `App.jsx`.
- Driver trip UI stub: [frontend/src/features/driver/DriverTrip.jsx](../../frontend/src/features/driver/DriverTrip.jsx) (placeholder snippet).

### Missing

- Routing to Admin dashboard, Admin sections (`AdminDrivers.jsx`, `AdminTrips.jsx`, etc.).
- Real JWT handling (token storage/refresh) and protected routes.
- Google Maps navigation integration (currently using OpenStreetMap + Leaflet only).
- Vehicle realtime tracking on map (no Firebase integration).

## Backend Status

- `backend/` is empty ([backend/.gitkeep](../../backend/.gitkeep)). No Express app, routes, controllers, or MongoDB models.
- No JWT issuance/verification, no persistence, no trip status updates.

## Realtime & Maps

- Current map stack: **OpenStreetMap + Leaflet**.
- SRS mentions Google Maps for embedded map & directions; that part is **not implemented**.
- Firebase Realtime Database for vehicle tracking: **not implemented**.

## API Alignment (vs. docs/API_Spec.md)

- `POST /api/auth/login`: UI calls mock login; **backend missing**.
- `POST /api/trips`: Passenger books via mock; **backend missing**.
- `GET /api/trips/:id`: Not implemented.
- `GET /api/driver/trips`: Not implemented.
- `POST /api/driver/trips/:id/status`: Not implemented.

## Must-Have Features — Status

- Auth + JWT + roles: **UI present, JWT mock only → Not done**.
- Passenger booking: **UI+mock implemented → Partial**.
- Passenger realtime tracking: **Not done**.
- Driver trip assignment & status updates: **Not done**.
- Google Maps directions: **Not done**.
- System auto-assignment, realtime sync, ETA: **Not done** (basic mock simulation only).

## Estimated Percentages (Area-wise)

- Auth (UI): 70% (forms/layout/routing), backend/JWT: 0% → overall ~40%.
- Passenger module: Map/GPS/click selection 80%, booking mock 60%, realtime tracking 0% → overall ~45%.
- Driver module: Auth 70%, trips UI 15%, logic 0% → overall ~25%.
- Admin module: Auth 70%, dashboard component 30%, routing/integration 0% → overall ~30%.
- Backend/API/MongoDB/JWT: **0%**.
- Realtime (Firebase): **0%**.
- Google Maps directions: **0%**.

## Risks & Gaps

- No backend foundation blocks other progress (auth, trips, status, persistence).
- Divergence from SRS for maps (Leaflet vs. Google Maps) unless accepted.
- Missing realtime layer (Firebase) prevents live vehicle tracking.

## Next Steps (Recommended)

1. Backend bootstrap (Express + MongoDB + JWT) and implement minimal endpoints from `docs/API_Spec.md`.
2. Wire frontend to real API with `fetch/axios`, replace mock services progressively.
3. Add protected routes and role-based guards in `frontend/src/App.jsx`.
4. Integrate Firebase Realtime for driver location updates and passenger tracking.
5. Add Google Maps Directions API (or accept Leaflet + OSRM as alternative and update SRS).
6. Admin routing and pages: register dashboard and management routes in `App.jsx`.
