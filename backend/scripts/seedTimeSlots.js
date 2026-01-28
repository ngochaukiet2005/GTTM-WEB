const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TimeSlot = require('../src/models/timeSlot.model');

// Load biến môi trường để lấy MONGO_URL
dotenv.config({ path: '../.env' }); 

// Fallback URL nếu không tìm thấy trong .env
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/smart_shuttle";

const seedData = async () => {
  try {
    // 1. Kết nối Database
    await mongoose.connect(MONGO_URL);
    console.log('🔌 Connected to MongoDB...');

    // 2. Xóa dữ liệu cũ
    await TimeSlot.deleteMany({});
    console.log('🗑️ Cleared old time slots');

    // 3. Tạo danh sách giờ bắt đầu theo yêu cầu (Cách nhau 2 tiếng)
    const startHours = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

    const slotsData = startHours.map((startHour, index) => {
        const endHour = startHour + 1;

        // Format thành chuỗi "HH:00"
        const startStr = startHour.toString().padStart(2, '0') + ":00";
        const endStr = endHour.toString().padStart(2, '0') + ":00";

        return {
            time: `${startStr} - ${endStr}`, // Ví dụ: "02:00 - 03:00"
            order: index + 1,                // 1, 2, 3... để sắp xếp
            isActive: true
        };
    });

    // 4. Lưu vào Database
    await TimeSlot.insertMany(slotsData);
    
    console.log('✨ Đã tạo các khung giờ sau:');
    slotsData.forEach(s => console.log(`   🕒 ${s.time}`));

    console.log(`✅ Hoàn tất! Đã tạo ${slotsData.length} khung giờ.`);
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu:', error);
    process.exit(1);
  }
};

seedData();