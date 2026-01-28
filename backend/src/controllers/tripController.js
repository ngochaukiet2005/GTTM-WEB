// backend/src/controllers/tripController.js

const SocketService = require('../services/socketService');
const RoutingService = require('../services/routingService');
const Trip = require('../models/trip.model');
const Driver = require('../models/driver.model');
const ShuttleRequest = require('../models/shuttleRequest.model');

// 1. Create Trip (Admin)
exports.createTrip = async (req, res, next) => {
  try {
    const { bookings, startTime, vehicleId, driverId } = req.body;

    const destinations = bookings.map(b => b.location);
    const station = { lat: 10.7423, lng: 106.6138 };

    // Tối ưu lộ trình
    const optimizedData = await RoutingService.optimizeTrip(station, destinations);
    const orderIndices = optimizedData.routes[0].optimizedIntermediateWaypointIndex;

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

    const newTrip = await Trip.create({
      vehicleId,
      driverId,
      timeSlot: new Date(startTime),
      route: formattedRoute,
      status: 'ready'
    });

    // Thông báo cho tài xế qua Socket (Dùng chuẩn userId room)
    const driver = await Driver.findById(driverId);
    if (driver) {
      SocketService.notifyDriver(driver.userId.toString(), "NEW_TRIP", {
        tripId: newTrip._id,
        message: "Bạn có chuyến xe mới!",
        data: newTrip
      });
    }

    res.status(201).json({ status: "success", data: newTrip });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. Dispatch Engine
exports.dispatchTrips = async (req, res, next) => {
  try {
    const { timeSlot, cutoffMinutes } = req.body;
    const result = await RoutingService.processDispatch(timeSlot, cutoffMinutes);
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

// 3. Update Stop Status (Driver Action)
exports.updateStopStatus = async (req, res, next) => {
  try {
    // 🔥 Sửa: Nhận stopId thay vì requestId để phân biệt điểm đón/trả
    const { tripId, stopId } = req.params;
    const { status } = req.body; // status: picked_up, dropped_off, no_show

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // 🔥 Tìm điểm dừng dựa trên _id của subdocument trong mảng route
    const stopIndex = trip.route.findIndex(item => item._id.toString() === stopId);

    if (stopIndex === -1) return res.status(404).json({ message: "Stop not found" });

    // Lấy requestId từ điểm dừng tìm thấy để cập nhật trạng thái ShuttleRequest sau này
    const requestId = trip.route[stopIndex].requestId;

    // Update Trip Route Status
    trip.route[stopIndex].status = status;

    // Map status -> ShuttleRequest Status
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
    const io = req.app.get('socketio');
    if (io) {
      // Gửi sự kiện cập nhật trạng thái điểm dừng
      SocketService.emitWaypointStatus(io, tripId, stopIndex, status);
    }

    // Check if trip completed
    const allDone = trip.route.every(s => ["dropped_off", "no_show", "completed"].includes(s.status));

    if (allDone) {
      trip.status = "completed";
      await Driver.findByIdAndUpdate(trip.driverId, { status: "active" });
      if (io) SocketService.emitTripStatus(io, tripId, "completed");
    } else {
      trip.status = "running";
      if (io) SocketService.emitTripStatus(io, tripId, "running");
    }

    await trip.save();
    res.status(200).json({ status: "success", data: { trip } });
  } catch (error) {
    next(error);
  }
};

// 4. Get All Trips (Updated populate)
exports.getAllTrips = async (req, res, next) => {
  try {
    let query = {};

    // Nếu là DRIVER, lấy trips của driver đó
    if (req.user && req.user.role === 'DRIVER') {
      // Tìm driver record dựa trên userId
      const driver = await Driver.findOne({ userId: req.user._id });
      if (!driver) {
        return res.status(404).json({ message: "Driver profile not found" });
      }
      query.driverId = driver._id;
    }

    // Populate sâu để lấy thông tin hành khách hiển thị lên UI Driver
    const trips = await Trip.find(query)
      .sort({ timeSlot: 1 })
      .populate({
        path: 'route.requestId',
        populate: { path: 'passengerId', select: 'name phone' } // Lấy tên & sđt khách
      });

    res.status(200).json({
      status: "success",
      data: { trips }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get Trip By ID
exports.getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driverId', 'fullName numberPhone')
      .populate({
        path: 'route.requestId',
        populate: { path: 'passengerId', select: 'name phone' }
      });

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.status(200).json({ status: "success", data: { trip } });
  } catch (error) {
    next(error);
  }
};