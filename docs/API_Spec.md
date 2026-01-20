# API SPECIFICATION

## Auth
POST /api/auth/login  
→ Đăng nhập, trả về JWT + role

## Passenger
POST /api/trips  
→ Tạo chuyến mới

GET /api/trips/:id  
→ Xem trạng thái chuyến

## Driver
GET /api/driver/trips  
→ Danh sách chuyến được phân

POST /api/driver/trips/:id/status  
→ Cập nhật trạng thái chuyến
