// const db = require('../configs/firebase'); // <-- ĐÃ XÓA DÒNG NÀY GÂY LỖI
const Trip = require("../models/trip.model");
const Driver = require("../models/driver.model");
const User = require("../models/user.model");
const ShuttleRequest = require("../models/shuttleRequest.model");
const socketService = require("./socketService");

// --- PHẦN 1: LOGIC TÍNH KHOẢNG CÁCH (Giữ lại để dùng sau nếu cần) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// --- PHẦN 2: TÌM TÀI XẾ (Đã sửa lại dùng MongoDB thay vì Firebase) ---
const findNearestDriver = async (passengerLat, passengerLng) => {
    // Logic đơn giản: Lấy tài xế đầu tiên đang active
    // Sau này bạn có thể nâng cấp dùng MongoDB GeoSpatial query ($near)
    const driver = await Driver.findOne({ status: 'active' });
    return driver ? driver._id : null;
};

// --- PHẦN 3: AUTO DISPATCH (Logic chính) ---
/**
 * Hàm này sẽ tự động tìm 1 tài xế trong DB và tạo chuyến đi ngay lập tức
 */
const autoDispatch = async (requestId) => {
    try {
        console.log(`🔄 [Dispatch] Đang xử lý yêu cầu: ${requestId}`);
        
        // 1. Lấy thông tin yêu cầu
        const request = await ShuttleRequest.findById(requestId);
        if (!request) {
            console.error("❌ [Dispatch] Không tìm thấy Request ID");
            return;
        }

        // 2. Tìm tài xế (Logic thông minh hơn)
        // Ưu tiên tài xế đang active
        let driver = await Driver.findOne({ status: 'active' }); 
        
        // --- SELF-HEALING: Nếu chưa có tài xế nào, tự động tạo từ User ROLE DRIVER ---
        if (!driver) {
            console.warn("⚠️ [Dispatch] Không tìm thấy Driver Profile nào. Đang thử tạo tự động...");
            
            // Tìm 1 user có role DRIVER bất kỳ
            const userDriver = await User.findOne({ role: 'DRIVER' });
            
            if (userDriver) {
                // Kiểm tra xem user này đã có driver profile chưa
                const existingDriver = await Driver.findOne({ userId: userDriver._id });
                
                if (!existingDriver) {
                    driver = await Driver.create({
                        userId: userDriver._id,
                        name: userDriver.fullName || "Tài xế Test",
                        phone: userDriver.numberPhone || "0000000000",
                        vehicleId: "AUTO-BUS-01",
                        capacity: 16,
                        status: "active"
                    });
                    console.log(`✅ [Dispatch] Đã tự động tạo Driver Profile cho user: ${userDriver.email}`);
                } else {
                    driver = existingDriver;
                }
            }
        }

        if (!driver) {
            console.error("❌ [Dispatch] HỆ THỐNG KHÔNG CÓ TÀI XẾ (Vui lòng tạo User có role DRIVER trước)");
            return;
        }

        // 3. Tạo chuyến đi mới (Trip)
        const newTrip = await Trip.create({
            driverId: driver._id,
            timeSlot: request.timeSlot,
            date: request.timeSlot, 
            status: "assigned", 
            vehicleId: driver.vehicleId || "BUS-SOCKET-01",
            currentLocation: "Bãi xe trung tâm",
            route: [
                {
                    requestId: request._id,
                    type: "pickup",
                    location: request.pickupLocation,
                    order: 1,
                    status: "pending"
                },
                {
                    requestId: request._id,
                    type: "dropoff",
                    location: request.dropoffLocation,
                    order: 2,
                    status: "pending"
                }
            ]
        });

        // 4. Cập nhật lại Request
        request.status = "assigned";
        request.tripId = newTrip._id;
        await request.save();

        console.log(`✅ [Dispatch] Thành công! Gán cho tài xế: ${driver.name} (TripID: ${newTrip._id})`);

        // 5. 🔥 BẮN SOCKET
        // Frontend join room bằng USER ID ("driver_" + user.id)
        // Backend phải gửi vào room đó
        const roomNameId = driver.userId.toString(); 

        socketService.notifyDriver(roomNameId, "NEW_TRIP", {
            tripId: newTrip._id,
            message: "Bạn có chuyến xe mới!",
            tripInfo: {
                pickup: request.pickupLocation,
                dropoff: request.dropoffLocation,
                time: request.timeSlot
            }
        });

        return newTrip;

    } catch (error) {
        console.error("❌ [Dispatch Error]", error);
    }
};

module.exports = { findNearestDriver, autoDispatch };