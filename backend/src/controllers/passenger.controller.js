const Passenger = require("../models/passenger.model");

// Verify ticket (Mock logic: Check 6 digits)
exports.verifyTicket = async (req, res, next) => {
    try {
        const { ticketCode } = req.body;

        // 1. Kiểm tra xem người dùng có gửi mã vé lên không
        if (!ticketCode) {
            return res.status(400).json({ message: "Vui lòng nhập mã vé" });
        }

        // 2. Logic giả định: Mã vé hợp lệ là chuỗi gồm đúng 6 chữ số
        // Regex /^\d{6}$/ : Bắt đầu và kết thúc phải là số, độ dài đúng 6
        const isValid = /^\d{6}$/.test(ticketCode);

        if (!isValid) {
            return res.status(400).json({ 
                message: "Mã vé không hợp lệ (Vui lòng nhập đúng 6 chữ số)" 
            });
        }

        // 3. Trả về thành công nếu đúng định dạng
        res.status(200).json({
            status: "success",
            message: "Xác thực vé thành công",
            data: { 
                ticketCode,
                // Giả lập thông tin vé trả về (nếu cần hiển thị)
                details: {
                    busOperator: "Phương Trang",
                    seat: "A01",
                    route: "BX Miền Tây - Cần Thơ"
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        let passenger = await Passenger.findOne({ userId: req.user.id });

        // Auto-create passenger profile if missing
        if (!passenger) {
            passenger = await Passenger.create({
                userId: req.user.id,
                name: req.user.fullName,
                phone: req.user.numberPhone,
            });
        }

        res.status(200).json({
            status: "success",
            data: { passenger }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        // Upsert passenger profile
        const passenger = await Passenger.findOneAndUpdate(
            { userId: req.user.id },
            { name, phone },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            status: "success",
            data: { passenger }
        });
    } catch (error) {
        next(error);
    }
};