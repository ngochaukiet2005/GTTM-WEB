// backend/src/controllers/driver.controller.js
const User = require("../models/user.model");
const Driver = require("../models/driver.model");
const AppError = require("../utils/appError");

// 1. LẤY DANH SÁCH TÀI XẾ
exports.getAllDrivers = async (req, res, next) => {
  try {
    // Populate để lấy email từ bảng User
    const drivers = await Driver.find().populate("userId", "email");

    const formattedDrivers = drivers.map(d => ({
      id: d._id,
      name: d.name,
      phone: d.phone,
      email: d.userId ? d.userId.email : "N/A", 
      plate: d.vehicleId,
      status: d.status, // active, inactive
      isLocked: d.status === 'inactive',
      rating: 5.0, 
      trips: 0
    }));

    res.status(200).json({
      status: "success",
      data: formattedDrivers
    });
  } catch (error) {
    next(error);
  }
};

// 2. TẠO TÀI XẾ MỚI
exports.createDriver = async (req, res, next) => {
  try {
    const { name, email, phone, plate, password } = req.body;

    if (!name || !email || !phone || !plate || !password) {
      return next(new AppError("Vui lòng điền đủ: Tên, Email, SĐT, Mật khẩu, Biển số", 400));
    }

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email này đã được sử dụng!", 400));
    }

    // A. Tạo User (Login)
    // Lưu ý: User Model của bạn dùng 'fullName' và 'numberPhone'
    const newUser = await User.create({
      fullName: name,       
      email,
      password: password, 
      numberPhone: phone,   
      role: "DRIVER",
      isVerified: true      // Admin tạo thì auto verify, không cần gửi mail
    });

    // B. Tạo Driver Profile
    // Lưu ý: Driver Model của bạn dùng 'name' và 'phone'
    const newDriver = await Driver.create({
      userId: newUser._id,
      name,                 
      phone,                
      vehicleId: plate,
      status: "active"
    });

    res.status(201).json({
      status: "success",
      data: newDriver
    });

  } catch (error) {
    next(error);
  }
};

// 3. KHÓA / MỞ KHÓA TÀI XẾ
exports.toggleDriverStatus = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const driver = await Driver.findById(id);
        
        if (!driver) return next(new AppError("Không tìm thấy tài xế", 404));

        // Đảo ngược trạng thái: active <-> inactive
        driver.status = driver.status === 'active' ? 'inactive' : 'active';
        await driver.save();

        res.status(200).json({ status: "success", message: "Đã cập nhật trạng thái" });
    } catch (error) {
        next(error);
    }
};

// 4. XÓA TÀI XẾ
exports.deleteDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findById(id);
        if (!driver) return next(new AppError("Không tìm thấy tài xế", 404));

        // Xóa cả User và Driver
        await User.findByIdAndDelete(driver.userId);
        await Driver.findByIdAndDelete(id);

        res.status(200).json({ status: "success", message: "Đã xóa tài xế" });
    } catch (error) {
        next(error);
    }
};