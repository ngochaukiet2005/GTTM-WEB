const router = require("express").Router();
const ShuttleRequest = require("../models/shuttleRequest.model");
const Passenger = require("../models/passenger.model");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandle");
const AppError = require("../utils/appError");

// Create a new shuttle request (Passenger books a trip)
router.post(
  "/",
  protect,
  restrictTo("USER"),
  asyncHandler(async (req, res) => {
    const { ticketCode, pickupLocation, dropoffLocation, direction, timeSlot } =
      req.body;

    // Validate input
    if (
      !ticketCode ||
      !pickupLocation ||
      !dropoffLocation ||
      !direction ||
      !timeSlot
    ) {
      throw new AppError(
        "Missing required fields: ticketCode, pickupLocation, dropoffLocation, direction, timeSlot",
        400,
      );
    }

    // Ensure passenger exists
    let passenger = await Passenger.findOne({ userId: req.user.id });
    if (!passenger) {
      passenger = await Passenger.create({
        userId: req.user.id,
        name: req.user.fullName,
        phone: req.user.numberPhone,
      });
    }

    // Create shuttle request
    const shuttleRequest = await ShuttleRequest.create({
      passengerId: passenger._id,
      ticketCode,
      pickupLocation,
      dropoffLocation,
      direction,
      timeSlot: new Date(timeSlot),
      status: "waiting",
    });

    res.status(201).json({
      status: "success",
      message: "Trip request created successfully",
      data: {
        tripId: shuttleRequest._id,
        status: shuttleRequest.status,
        pickupLocation: shuttleRequest.pickupLocation,
        dropoffLocation: shuttleRequest.dropoffLocation,
        timeSlot: shuttleRequest.timeSlot,
      },
    });
  }),
);

// Get shuttle request status
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await ShuttleRequest.findById(id).populate("tripId");

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    // Security: Only passenger can view their own request
    const passenger = await Passenger.findOne({ userId: req.user.id });
    if (
      !passenger ||
      request.passengerId.toString() !== passenger._id.toString()
    ) {
      throw new AppError("You don't have permission to view this request", 403);
    }

    let tripInfo = null;
    if (request.tripId) {
      const trip = request.tripId;
      const stop = trip.route.find(
        (r) => r.requestId.toString() === request._id.toString(),
      );
      tripInfo = {
        tripStatus: trip.status,
        vehicleId: trip.vehicleId,
        stopOrder: stop?.order || null,
        stopStatus: stop?.status || null,
      };
    }

    res.status(200).json({
      status: "success",
      data: {
        id: request._id,
        ticketCode: request.ticketCode,
        status: request.status,
        direction: request.direction,
        pickupLocation: request.pickupLocation,
        dropoffLocation: request.dropoffLocation,
        timeSlot: request.timeSlot,
        tripInfo,
      },
    });
  }),
);

// Get all trip requests for current user
router.get(
  "/",
  protect,
  restrictTo("USER"),
  asyncHandler(async (req, res) => {
    const passenger = await Passenger.findOne({ userId: req.user.id });
    if (!passenger) {
      throw new AppError("Passenger profile not found", 404);
    }

    const requests = await ShuttleRequest.find({ passengerId: passenger._id })
      .sort({ createdAt: -1 })
      .populate("tripId");

    const formatted = requests.map((reqItem) => {
      let tripInfo = null;
      if (reqItem.tripId) {
        const trip = reqItem.tripId;
        const stop = trip.route.find(
          (r) => r.requestId.toString() === reqItem._id.toString(),
        );
        tripInfo = {
          tripStatus: trip.status,
          vehicleId: trip.vehicleId,
          stopOrder: stop?.order || null,
          stopStatus: stop?.status || null,
        };
      }

      return {
        id: reqItem._id,
        ticketCode: reqItem.ticketCode,
        status: reqItem.status,
        direction: reqItem.direction,
        pickupLocation: reqItem.pickupLocation,
        dropoffLocation: reqItem.dropoffLocation,
        timeSlot: reqItem.timeSlot,
        tripInfo,
      };
    });

    res.status(200).json({
      status: "success",
      results: formatted.length,
      data: {
        trips: formatted,
      },
    });
  }),
);

module.exports = router;
