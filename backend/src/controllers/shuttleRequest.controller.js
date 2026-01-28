const ShuttleRequest = require("../models/shuttleRequest.model");
const Passenger = require("../models/passenger.model");
const mongoose = require("mongoose");
const dispatchService = require("../services/dispatch.service.v2"); // 🔥 SỬ DỤNG V2

exports.createRequest = async (req, res, next) => {
    try {
        const {
            ticketCode,
            pickupLocation,
            dropoffLocation,
            direction,
            timeSlot,
            tripDate
        } = req.body;

        const userId = req.user._id; // ✅ Sửa: _id thay vì id

        // 1. Validate input
        if (!ticketCode || !pickupLocation || !dropoffLocation || !direction || !timeSlot) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin: Vé, Điểm đón/trả, Giờ đi"
            });
        }

        // --- XỬ LÝ NGÀY GIỜ ---
        let finalTimeSlotDate;
        try {
            const startTimeStr = timeSlot.split(" - ")[0].trim();
            if (tripDate) {
                finalTimeSlotDate = new Date(`${tripDate}T${startTimeStr}:00`);
            } else {
                const now = new Date();
                const [hours, minutes] = startTimeStr.split(':');
                finalTimeSlotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            }

            if (isNaN(finalTimeSlotDate.getTime())) throw new Error("Invalid Date generated");
        } catch (err) {
            console.error("Lỗi xử lý thời gian:", err);
            return res.status(400).json({
                message: "Định dạng thời gian không hợp lệ. Vui lòng thử lại."
            });
        }

        // 2. Ensure passenger exists
        let passenger = await Passenger.findOne({ userId });
        if (!passenger) {
            passenger = await Passenger.create({
                userId,
                name: req.user.fullName || "User",
                phone: req.user.numberPhone || req.user.phone || ""
            });
        }

        // 3. Create shuttle request
        const shuttleRequest = await ShuttleRequest.create({
            passengerId: passenger._id,
            ticketCode,
            pickupLocation,
            dropoffLocation,
            direction,
            timeSlot: finalTimeSlotDate,
            status: "waiting"
        });

        // --- [MỚI] GỌI AUTO DISPATCH ---
        // Await để đảm bảo logic chạy xong hoặc bắt được lỗi
        try {
            console.log(`[Controller] Khởi chạy autoDispatch cho request: ${shuttleRequest._id}`);
            await dispatchService.autoDispatch(shuttleRequest._id);
        } catch (dispatchError) {
            console.error("❌ [Controller] Lỗi khi Dispatch:", dispatchError);
            // Vẫn trả về 201 vì request đã được lưu, nhưng log lỗi để debug
        }

        res.status(201).json({
            status: "success",
            data: shuttleRequest
        });
    } catch (error) {
        console.error("Create Request Error:", error);
        next(error);
    }
};

exports.getRequestStatus = async (req, res, next) => {
    try {
        const userId = req.user._id; // ✅ Sửa: _id thay vì id

        const passenger = await Passenger.findOne({ userId });
        if (!passenger) {
            return res.status(200).json({
                status: "success",
                data: {
                    passengerName: req.user.fullName || "Khách",
                    currentRequest: null,
                    history: []
                }
            });
        }

        const requests = await ShuttleRequest
            .find({ passengerId: passenger._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("tripId");

        const formatted = requests.map(reqItem => {
            let tripInfo = null;

            if (reqItem.tripId) {
                const trip = reqItem.tripId;
                const stop = trip.route ? trip.route.find(
                    r => r.requestId && r.requestId.toString() === reqItem._id.toString()
                ) : null;

                tripInfo = {
                    tripStatus: trip.status,
                    vehicleId: trip.vehicleId,
                    stopOrder: stop?.order || null,
                    stopStatus: stop?.status || null
                };
            }

            const d = new Date(reqItem.timeSlot);
            const timeString = !isNaN(d.getTime())
                ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
                : "N/A";

            return {
                id: reqItem._id,
                ticketCode: reqItem.ticketCode,
                status: reqItem.status,
                direction: reqItem.direction,
                pickupLocation: reqItem.pickupLocation,
                dropoffLocation: reqItem.dropoffLocation,
                timeSlot: timeString,
                fullTime: reqItem.timeSlot,
                tripInfo
            };
        });

        res.status(200).json({
            status: "success",
            data: {
                passengerName: passenger.name,
                currentRequest: formatted.find(r =>
                    ["waiting", "assigned", "running"].includes(r.status)
                ) || null,
                history: formatted
            }
        });
    } catch (error) {
        console.error("Get Status Error:", error);
        next(error);
    }
};

exports.cancelRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(`[Cancel Request] User ${req.user._id} attempting to cancel request ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`[Cancel Request] Invalid Request ID: ${id}`);
            return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
        }

        const request = await ShuttleRequest.findById(id);
        if (!request) {
            console.warn(`[Cancel Request] Request not found: ${id}`);
            return res.status(404).json({ message: "Không tìm thấy yêu cầu đặt chuyến" });
        }

        const passenger = await Passenger.findOne({ userId: req.user._id });

        if (!passenger || request.passengerId.toString() !== passenger._id.toString()) {
            console.warn(`[Cancel Request] Permission denied. Owner: ${request.passengerId}, Requester: ${passenger?._id}`);
            return res.status(403).json({ message: "Bạn không có quyền hủy chuyến đi này" });
        }

        if (request.status !== "waiting") {
            return res.status(400).json({ message: "Chuyến đã được tài xế nhận hoặc đang chạy, không thể hủy." });
        }

        request.status = "cancelled";
        await request.save();

        console.log(`[Cancel Request] Success: ${id}`);
        res.status(200).json({
            status: "success",
            message: "Hủy đặt chuyến thành công"
        });
    } catch (error) {
        console.error("[Cancel Request] Internal Error:", error);
        next(error);
    }
};

exports.getAllPendingRequests = async (req, res, next) => {
    try {
        const requests = await ShuttleRequest.find({ status: "waiting" })
            .populate({
                path: 'passengerId',
                select: 'name phone'
            })
            .sort({ createdAt: 1 });

        res.status(200).json({
            status: "success",
            results: requests.length,
            data: { requests }
        });
    } catch (error) {
        next(error);
    }
};