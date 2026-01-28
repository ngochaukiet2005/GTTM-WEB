const User = require("../models/user.model");
const TimeSlot = require("../models/timeSlot.model");

/**
 * Hạt giống (Seed) dữ liệu mặc định
 */
const seedData = async () => {
    try {
        // 1. Seed Admin
        const adminEmail = "admin@gttm.com";
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log("🌱 [Seed] Đang tạo tài khoản Admin mặc định...");
            await User.create({
                fullName: "System Administrator",
                email: adminEmail,
                numberPhone: "0999999999",
                password: "admin123",
                role: "ADMIN",
                isVerified: true,
                gender: "MALE"
            });
            console.log("✅ [Seed] Tài khoản Admin đã được tạo: admin@gttm.com / admin123");
        }

        // 2. Seed TimeSlots
        const slotCount = await TimeSlot.countDocuments();
        if (slotCount === 0) {
            console.log("🌱 [Seed] Đang tạo danh sách khung giờ (TimeSlots)...");
            const slots = [];
            for (let i = 0; i < 24; i++) {
                const hour = i.toString().padStart(2, '0');
                const nextHour = ((i + 1) % 24).toString().padStart(2, '0');
                slots.push({
                    time: `${hour}:00 - ${nextHour}:00`,
                    order: i,
                    isActive: true
                });
            }
            await TimeSlot.insertMany(slots);
            console.log(`✅ [Seed] Đã tạo thành công ${slots.length} khung giờ.`);
        } else {
            console.log("ℹ️ [Seed] Khung giờ đã tồn tại, bỏ qua.");
        }

    } catch (error) {
        console.error("❌ Lỗi khi chạy Seed Service:", error.message);
    }
};

module.exports = seedData;
