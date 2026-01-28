# 🚌 Bài Toán Hệ Thống Điều Phối Xe Trung Chuyển (Smart Shuttle Dispatch System)

## 1. Giới thiệu tổng quan
Trong bối cảnh giao thông đô thị hiện đại, nhu cầu di chuyển chặng ngắn (last-mile connection) từ các điểm trung chuyển chính (như ga tàu, bến xe, trạm metro) về nhà hoặc nơi làm việc là rất lớn. **Smart Shuttle Dispatch System (GTTM-WEB)** được xây dựng để tối ưu hóa quy trình đặt xe, điều phối và quản lý chuyến xe trung chuyển, giúp hành khách di chuyển thuận tiện và doanh nghiệp vận tải quản lý hiệu quả.

## 2. Mô tả bài toán (Problem Statement)
Hệ thống giải quyết các vấn đề chính sau:
- **Đặt xe chặng ngắn:** Hành khách cần một giải pháp đặt xe nhanh chóng từ điểm đón đến điểm trả trong phạm vi hoạt động của xe trung chuyển.
- **Điều phối thông minh (Dispatching):** Thay vì tài xế tự tìm khách, hệ thống cần gom các yêu cầu của khách hàng có cùng khung giờ và lộ trình gần nhau vào một chuyến xe để tối ưu hóa công suất xe (capacity) và tiết kiệm nhiên liệu.
- **Theo dõi thời gian thực (Real-time Tracking):** Hành khách cần biết xe đang ở đâu, và tài xế cần biết lộ trình các điểm dừng cần ghé qua.
- **Quản lý tập trung:** Admin cần cái nhìn tổng quan về tất cả các chuyến xe, trạng thái các yêu cầu và hiệu suất hoạt động.

## 3. Đối tượng sử dụng (Stakeholders)
Hệ thống phục vụ 3 nhóm đối tượng chính:
1.  **Hành khách (Passenger):**
    - Đăng ký/đăng nhập và xác thực tài khoản.
    - Tạo yêu cầu đặt xe (với mã vé, điểm đón/trả, khung giờ).
    - Theo dõi lịch sử và trạng thái chuyến đi.
2.  **Tài xế (Driver):**
    - Xem danh sách các chuyến xe được gán.
    - Theo dõi lộ trình điểm dừng (stops).
    - Cập nhật trạng thái đón/trả khách tại mỗi điểm.
3.  **Quản trị viên (Admin):**
    - Quản lý người dùng và phương tiện.
    - Thực hiện điều phối (dispatch) các yêu cầu đang chờ thành các chuyến xe cụ thể.
    - Giám sát toàn bộ hoạt động của hệ thống.

## 4. Các tính năng cốt lõi (Core Features)
- **Hệ thống xác thực bảo mật:** Sử dụng JWT (JSON Web Token) kết hợp xác thực OTP qua Email để đảm bảo an toàn tài khoản.
- **Quản lý yêu cầu (Shuttle Request):** Quy trình từ lúc khách đặt chỗ -> chờ điều phối -> đã gán -> đang di chuyển -> hoàn thành.
- **Thuật toán gom chuyến (Dispatching Logic):** Admin có thể gom các yêu cầu đơn lẻ thành một chuyến xe đa điểm dừng (multi-stop route).
- **Tích hợp bản đồ:** Sử dụng Leaflet để hiển thị vị trí và lộ trình (đang trong quá trình hoàn thiện).

## 5. Kiến trúc kỹ thuật (Technical Architecture)
Dự án được xây dựng theo mô hình **Client-Server**:
- **Frontend:** React.js với Vite, Tailwind CSS cho giao diện hiện đại, responsive.
- **Backend:** Node.js với Express framework, xử lý logic nghiệp vụ và API RESTful.
- **Database:** MongoDB (NoSQL) giúp lưu trữ dữ liệu linh hoạt, hỗ trợ tốt cho các cấu trúc dữ liệu dạng mảng (lộ trình chuyến xe).
- **Xác thực:** JWT (Access Token & Refresh Token) giúp duy trì phiên đăng nhập bảo mật.

## 6. Luồng hoạt động chính (Main Workflow)
1.  **Khách hàng** đăng nhập và gửi yêu cầu di chuyển (`pickup`, `dropoff`, `timeslot`).
2.  Yêu cầu được đưa vào hàng đợi với trạng thái `waiting`.
3.  **Admin** thực hiện gom các yêu cầu `waiting` có cùng đặc điểm và tạo một **Trip**.
4.  **Hệ thống** gán **Trip** cho một **Tài xế** và xe còn trống.
5.  **Tài xế** nhận chuyến, bắt đầu di chuyển và cập nhật trạng thái đón/trả khách tại mỗi điểm dừng thông qua ứng dụng.
6.  **Khách hàng** và **Admin** theo dõi tiến độ chuyến đi cho đến khi hoàn thành.

## 7. Định hướng phát triển
- Tích hợp **Firebase Realtime** để theo dõi vị trí xe trực tiếp trên bản đồ.
- Áp dụng **thuật toán tối ưu hóa lộ trình** (Traveling Salesman Problem - TSP) để tự động sắp xếp thứ tự các điểm dừng sao cho quãng đường ngắn nhất.
- Tích hợp cổng thanh toán trực tuyến và hệ thống đánh giá (rating).

---
*Tài liệu này được soạn thảo để mô tả bài toán và giải pháp kỹ thuật cho hệ thống Smart Shuttle Dispatch.*
