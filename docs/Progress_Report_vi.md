# Báo Cáo Tiến Độ Dự Án — GTTM-WEB (2026-01-28)

## Tổng Quan

- Ước lượng hoàn thành: **35%**
- Frontend (UI/quy trình): **~55%**
- Backend (API, DB, xác thực): **0%**
- Theo dõi realtime (Firebase): **0%**

Ước lượng dựa trên phạm vi trong `docs/Demo_Guide.md` và `docs/API_Spec.md`, đối chiếu với phần đã triển khai trong `frontend/src/**` và `backend/**`.

## Phạm Vi Tham Chiếu

- Chức năng bắt buộc theo SRS (`docs/Demo_Guide.md`):
  - Xác thực JWT và phân quyền theo vai trò
  - Hành khách: bản đồ, chọn điểm đón/trả, đặt chuyến, theo dõi xe realtime
  - Tài xế: nhận chuyến, xem lộ trình tổng quát, dẫn đường Google Maps, cập nhật trạng thái chuyến
  - Hệ thống: tự động phân xe, đồng bộ vị trí realtime, ước lượng thời gian đến (ETA)
- Đặc tả API (`docs/API_Spec.md`): đăng nhập, CRUD chuyến của hành khách, danh sách chuyến của tài xế/cập nhật trạng thái.

## Trạng Thái Frontend

### Đã Triển Khai (UI / Mock)

- Landing & chọn vai trò: [frontend/src/features/LandingPage.jsx](../../frontend/src/features/LandingPage.jsx)
- Màn hình đăng nhập (UI):
  - Hành khách: [PassengerAuth](../../frontend/src/features/passenger/PassengerAuth.jsx), form: [AuthForm](../../frontend/src/features/auth/AuthForm.jsx), layout: [AuthLayout](../../frontend/src/features/auth/AuthLayout.jsx)
  - Tài xế: [DriverAuth](../../frontend/src/features/driver/DriverAuth.jsx)
  - Quản trị: [AdminAuth](../../frontend/src/features/admin/AdminAuth.jsx)
- Bản đồ + GPS + chọn điểm (Hành khách):
  - Trang: [PassengerHome](../../frontend/src/features/passenger/PassengerHome.jsx)
  - Component bản đồ (Leaflet): [AppMap](../../frontend/src/features/map/AppMap.jsx)
- Dịch vụ giả lập:
  - Hành khách: [mockApiPassenger](../../frontend/src/core/services/mockApiPassenger.js)
  - Tài xế: [mockApiDriver](../../frontend/src/core/services/mockApiDriver.js)
  - Quản trị: [mockApiAdmin](../../frontend/src/core/services/mockApiAdmin.js)

### Đang Triển Khai / Dở Dang

- Quy trình đặt chuyến dùng mock (`createTrip`) — chưa có API thật.
- Component dashboard admin: [AdminDashboard](../../frontend/src/features/admin/AdminDashboard.jsx) — chưa khai báo route trong `App.jsx`.
- Màn hình chuyến của tài xế: [DriverTrip](../../frontend/src/features/driver/DriverTrip.jsx) — đang là đoạn mã minh họa.

### Thiếu

- Khai báo route tới dashboard/admin sections (`AdminDrivers.jsx`, `AdminTrips.jsx`, ...).
- Xử lý JWT thật (lưu/refresh) và bảo vệ route.
- Tích hợp dẫn đường Google Maps (hiện dùng OpenStreetMap + Leaflet).
- Theo dõi vị trí xe realtime trên bản đồ (chưa tích hợp Firebase).

## Trạng Thái Backend

- `backend/` đang trống ([backend/.gitkeep](../../backend/.gitkeep)). Chưa có ứng dụng Express, route, controller, hay model MongoDB.
- Chưa có phát hành/kiểm tra JWT, chưa có lưu trữ dữ liệu, chưa có cập nhật trạng thái chuyến.

## Realtime & Bản Đồ

- Stack bản đồ hiện tại: **OpenStreetMap + Leaflet**.
- SRS đề cập Google Maps để nhúng bản đồ & chỉ đường; phần này **chưa triển khai**.
- Firebase Realtime Database để theo dõi xe: **chưa triển khai**.

## Đối Chiếu API (so với docs/API_Spec.md)

- `POST /api/auth/login`: UI gọi mock login; **chưa có backend**.
- `POST /api/trips`: Hành khách đặt qua mock; **chưa có backend**.
- `GET /api/trips/:id`: Chưa triển khai.
- `GET /api/driver/trips`: Chưa triển khai.
- `POST /api/driver/trips/:id/status`: Chưa triển khai.

## Chức Năng Bắt Buộc — Trạng Thái

- Auth + JWT + vai trò: **UI có, JWT giả → Chưa xong**.
- Đặt chuyến (hành khách): **UI + mock → Một phần**.
- Theo dõi realtime (hành khách): **Chưa xong**.
- Phân/nhận chuyến & cập nhật trạng thái (tài xế): **Chưa xong**.
- Dẫn đường Google Maps: **Chưa xong**.
- Tự động phân xe, đồng bộ realtime, ETA: **Chưa xong** (chỉ có mô phỏng đơn giản).

## Ước Lượng Phần Trăm (Theo Mảng)

- Auth: UI 70% (form/layout/routing), backend/JWT 0% → tổng ~40%.
- Hành khách: Map/GPS/chọn điểm 80%, đặt chuyến mock 60%, realtime 0% → tổng ~45%.
- Tài xế: Auth 70%, UI chuyến 15%, logic 0% → tổng ~25%.
- Admin: Auth 70%, component dashboard 30%, routing/integration 0% → tổng ~30%.
- Backend/API/MongoDB/JWT: **0%**.
- Realtime (Firebase): **0%**.
- Dẫn đường Google Maps: **0%**.

## Rủi Ro & Khoảng Trống

- Chưa có nền tảng backend gây chặn tiến độ (auth, chuyến, trạng thái, lưu trữ).
- Khác biệt so với SRS về bản đồ (Leaflet vs Google Maps) nếu không điều chỉnh.
- Thiếu lớp realtime (Firebase) nên không thể theo dõi xe trực tiếp.

## Bước Tiếp Theo (Khuyến Nghị)

1. Khởi tạo backend (Express + MongoDB + JWT) và hiện thực tối thiểu các endpoint theo `docs/API_Spec.md`.
2. Nối frontend vào API thật bằng `fetch/axios`, thay dần các mock service.
3. Thêm route bảo vệ và guard theo vai trò trong `frontend/src/App.jsx`.
4. Tích hợp Firebase Realtime cho cập nhật vị trí tài xế và theo dõi của hành khách.
5. Tích hợp Google Maps Directions API (hoặc chấp nhận Leaflet + OSRM và cập nhật SRS).
6. Khai báo routing admin và các trang quản trị trong `App.jsx`.
