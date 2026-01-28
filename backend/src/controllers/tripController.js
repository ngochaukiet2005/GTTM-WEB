// backend/src/controllers/tripController.js

const SocketService = require('../services/socketService'); // <-- Đổi thành SocketService
const RoutingService = require('../services/routingService');
const Trip = require('../models/trip.model');
const Driver = require('../models/driver.model');
const ShuttleRequest = require('../models/shuttleRequest.model');

// 1. Create an optimized trip from a collection of bookings (Admin/Dispatch action)
exports.createTrip = async (req, res, next) => {
  try {
    const { bookings, startTime, vehicleId, driverId } = req.body;

    const destinations = bookings.map(b => b.location); // Các điểm đón trả
    const station = { lat: 10.7423, lng: 106.6138 }; // Nhà xe

    // Gọi Routing Service để tối ưu lộ trình
    const optimizedData = await RoutingService.optimizeTrip(station, destinations);
    
    // Lấy thứ tự index đã tối ưu
    const orderIndices = optimizedData.routes[0].optimizedIntermediateWaypointIndex;

    // Sắp xếp lại danh sách booking theo lộ trình tối ưu
    const formattedRoute = orderIndices.map((originalIndex, i) => {
      const booking = bookings[originalIndex];
      return {
        requestId: booking.requestId,
        location: booking.location.address || booking.location,
        type: booking.type || "pickup",
        order: i + 1,
        status: 'pending'
      };
    });

    // Lưu vào MongoDB
    const newTrip = await Trip.create({
      vehicleId,
      driverId,
      timeSlot: new Date(startTime),
      route: formattedRoute,
      status: 'ready'
    });

    // Với Socket.IO, ta không cần "khởi tạo" node như Firebase.
    // Nếu muốn thông báo cho tài xế ngay lập tức, có thể emit sự kiện tại đây.
    // Ví dụ: 
    // const io = req.app.get('socketio');
    // io.emit(`driver_new_trip_${driverId}`, newTrip);

    res.status(201).json({ status: "success", data: newTrip });
  } catch (error) {
    // Chuyển lỗi sang middleware xử lý lỗi
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. Dispatch Engine: Legacy/Semi-auto dispatch
exports.dispatchTrips = async (req, res, next) => {
  try {
    const { timeSlot, cutoffMinutes } = req.body;
    // This utilizes the standard processDispatch logic in RoutingService
    const result = await RoutingService.processDispatch(timeSlot, cutoffMinutes);
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

// 3. Update stop status by Driver
exports.updateStopStatus = async (req, res, next) => {
  try {
    const { tripId, requestId, status } = req.body; // status: picked_up, dropped_off, no_show

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Tìm điểm dừng trong mảng route
    const stopIndex = trip.route.findIndex(item => item.requestId.toString() === requestId);
    if (stopIndex === -1) return res.status(404).json({ message: "Stop not found in this trip" });

    // Cập nhật trạng thái trong MongoDB
    trip.route[stopIndex].status = status;

    // Map internal stop status to Request status
    const requestStatusMap = {
      "picked_up": "running",
      "dropped_off": "completed",
      "no_show": "no_show"
    };

    if (requestId) {
      await ShuttleRequest.findByIdAndUpdate(requestId, {
        status: requestStatusMap[status] || "assigned"
      });
    }

    // --- SOCKET IO UPDATE ---
    // Lấy instance io từ app
    const io = req.app.get('socketio');
    
    // Bắn sự kiện cập nhật trạng thái điểm dừng
    if (io) {
        SocketService.emitWaypointStatus(io, tripId, stopIndex, status);
    }

    // Kiểm tra xem chuyến đi đã hoàn thành hết chưa
    const allDone = trip.route.every(s => ["dropped_off", "no_show"].includes(s.status));
    
    if (allDone) {
      trip.status = "completed";
      await Driver.findByIdAndUpdate(trip.driverId, { status: "active" });
      
      // --- SOCKET IO UPDATE: Hoàn thành chuyến ---
      if (io) {
          SocketService.emitTripStatus(io, tripId, "completed");
      }
    } else {
      trip.status = "running";
      // --- SOCKET IO UPDATE: Chuyến đang chạy ---
      if (io) {
          SocketService.emitTripStatus(io, tripId, "running");
      }
    }

    await trip.save();
    res.status(200).json({ status: "success", data: { trip } });
  } catch (error) {
    next(error);
  }
};

exports.getAllTrips = async (req, res, next) => {
  try {
    let query = {};

    // If user is a driver, only show their trips
    if (req.user && req.user.role === 'DRIVER') {
      const driver = await Driver.findOne({ userId: req.user.id });
      if (!driver) return res.status(404).json({ message: "Driver profile not found" });
      query.driverId = driver._id;
    }

    const trips = await Trip.find(query).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: trips.length, data: { trips } });
  } catch (error) {
    next(error);
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('driverId', 'fullName numberPhone').populate('route.requestId');
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.status(200).json({ status: "success", data: { trip } });
  } catch (error) {
    next(error);
  }
};