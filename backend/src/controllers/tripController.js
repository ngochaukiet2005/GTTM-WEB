const FirebaseService = require('../services/firebaseService');
const RoutingService = require('../services/routingService');
const Trip = require('../models/trip.model');
const Driver = require('../models/driver.model');
const ShuttleRequest = require('../models/shuttleRequest.model');

// 1. Create an optimized trip from a collection of bookings (Admin/Dispatch action)
exports.createTrip = async (req, res) => {
  try {
    const { bookings, startTime, vehicleId, driverId } = req.body;

    const destinations = bookings.map(b => b.location); // Các điểm đón trả
    const station = { lat: 10.7423, lng: 106.6138 }; // Nhà xe

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

    await FirebaseService.updateWaypointStatus(newTrip._id, 0, 'initialized');

    res.status(201).json({ status: "success", data: newTrip });
  } catch (error) {
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

    const stop = trip.route.find(item => item.requestId.toString() === requestId);
    if (!stop) return res.status(404).json({ message: "Stop not found in this trip" });

    stop.status = status;

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

    // Auto-complete trip if all stops done
    const allDone = trip.route.every(s => ["dropped_off", "no_show"].includes(s.status));
    if (allDone) {
      trip.status = "completed";
      await Driver.findByIdAndUpdate(trip.driverId, { status: "active" });
    } else {
      trip.status = "running";
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
    if (req.user.role === 'DRIVER') {
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
