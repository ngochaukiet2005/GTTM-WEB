const User = require("../models/user.model");

/**
 * Hạt giống (Seed) tài khoản Admin mặc định nếu chưa tồn tại
 */
const seedAdmin = async () => {
    try {
        const adminEmail = "admin@gttm.com";
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log("🌱 Trình tạo hạt giống: Đang tạo tài khoản Admin mặc định...");

            await User.create({
                fullName: "System Administrator",
                email: adminEmail,
                numberPhone: "0999999999",
                password: "admin123@password", // Sẽ được tự động hash bởi pre-save middleware
                role: "ADMIN",
                isVerified: true,
                gender: "MALE"
            });

            console.log("✅ Tài khoản Admin đã được tạo thành công!");
            console.log("📧 Email: " + adminEmail);
            console.log("🔑 Password: admin123@password");
        } else {
            console.log("ℹ️ Tài khoản Admin đã tồn tại, bỏ qua bước tạo hạt giống.");
        }
    } catch (error) {
        console.error("❌ Lỗi khi tạo hạt giống Admin:", error.message);
    }
};

module.exports = seedAdmin;
