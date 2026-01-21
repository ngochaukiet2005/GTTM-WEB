# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## AUTO SHUTTLE WEB APPLICATION

---

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này mô tả các yêu cầu chức năng và phi chức năng của hệ thống Auto Shuttle Web Application nhằm phục vụ việc phân tích, thiết kế và triển khai dự án.

### 1.2 Phạm vi
Hệ thống là một web application responsive, hoạt động tốt trên cả điện thoại và máy tính, hỗ trợ đặt xe trung chuyển, theo dõi xe realtime và điều hướng cho tài xế.

---

## 2. Tổng quan hệ thống

### 2.1 Mô tả
Hệ thống gồm frontend web, backend REST API, cơ sở dữ liệu NoSQL và hệ thống realtime để cập nhật vị trí xe.

### 2.2 Các tác nhân
- Hành khách
- Tài xế
- Hệ thống

---

## 3. Yêu cầu chức năng

### 3.1 Chức năng chung
- Đăng nhập
- Xác thực bằng JWT
- Phân quyền theo role

### 3.2 Hành khách
- Xác định vị trí hiện tại realtime
- Hiển thị bản đồ Google Maps
- Chọn điểm đón / trả bằng cách click bản đồ
- Đặt chuyến
- Theo dõi vị trí xe realtime

### 3.3 Tài xế
- Nhận chuyến
- Xem lộ trình tổng quát
- Mở Google Maps để dẫn đường từng chặng
- Cập nhật trạng thái chuyến

### 3.4 Hệ thống
- Phân xe tự động
- Đồng bộ vị trí xe realtime
- Ước lượng thời gian đến (ETA)

---

## 4. Yêu cầu phi chức năng
- Thời gian phản hồi < 5 giây
- Giao diện responsive
- Bảo mật JWT
- Dễ mở rộng

---

## 5. Kiến trúc
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Database: MongoDB
- Realtime: Firebase
- Bản đồ: OpenStreetMap + Leaflet

---

## 6. Ràng buộc & giả định
- Có Internet
- Phụ thuộc Google Maps API

---

## 7. Kết luận
Hệ thống có tính khả thi cao, phù hợp đồ án sinh viên và có khả năng mở rộng.