# 🚌 Smart Shuttle Dispatch System (GTTM-WEB)

Chào mừng bạn đến với hệ thống điều phối xe trung chuyển thông minh. Đây là giải pháp quản lý dịch vụ xe shuttle chặng ngắn, tối ưu hóa quy trình điều phối và theo dõi chuyến đi.

---

## 📄 Tài liệu Dự án (Documentation)

Dự án cung cấp bộ tài liệu đầy đủ bằng cả tiếng Việt và tiếng Anh để bạn dễ dàng tiếp cận:

### 🇻🇳 Tiếng Việt
- **[Mô tả bài toán](MO_TA_BAI_TOAN.md)**: Chi tiết về bài toán xe trung chuyển và giải pháp.
- **[Tóm tắt tiến độ](SUMMARY_VI.md)**: Tổng hợp các tính năng đã thực hiện.

### 🇺🇸 English
- **[Architecture](ARCHITECTURE.md)**: System design and data models.
- **[API Reference](API_QUICK_REFERENCE.md)**: Detailed documentation of all 27 API endpoints.
- **[Quick Start](QUICK_START.md)**: Get the system running in 5 minutes.
- **[Backend Implementation](BACKEND_IMPLEMENTATION.md)**: Technical details of the backend.

---

## 🚀 Trạng thái dự án (Current Status)

| Thành phần | Trạng thái | Hoàn thành |
| :--- | :--- | :--- |
| **Backend API** | ✅ Hoàn thành | 100% |
| **Database (MongoDB)** | ✅ Hoàn thành | 100% |
| **Authentication (JWT/OTP)** | ✅ Hoàn thành | 100% |
| **Frontend UI** | 🔄 Đang phát triển | 55% |
| **Realtime Tracking** | ⏳ Giai đoạn tới | 0% |

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend
- React.js + Vite
- Tailwind CSS
- Leaflet Maps
- SweetAlert2

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (Authentication)
- Nodemailer (OTP Service)

---

## 📋 Hướng dẫn cài đặt nhanh

1. **Khởi động MongoDB**: Chạy MongoDB local hoặc dùng MongoDB Atlas.
2. **Cài đặt Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. **Cài đặt Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Truy cập**: Mở `http://localhost:5173` để bắt đầu.

---

## 📞 Liên hệ & Hỗ trợ

Nếu bạn gặp khó khăn trong quá trình cài đặt hoặc vận hành, vui lòng kiểm tra các file tài liệu trong thư mục `docs/` hoặc đọc file **[QUICK_START.md](QUICK_START.md)**.

---
*Dự án được phát triển cho chuyên đề Hệ thống giao thông thông minh.*