const ShuttleRequest = require("../models/shuttleRequest.model");
const Passenger = require("../models/passenger.model");

exports.createRequest = async (req, res, next) => {
    try {
        const {
            ticketCode,
            pickupLocation,
            dropoffLocation,
            direction,
            timeSlot
        } = req.body;

        const userId = req.user.id;

        // 1. Validate input
        if (!ticketCode || !pickupLocation || !dropoffLocation || !direction || !timeSlot) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // 2. Ensure passenger exists
        let passenger = await Passenger.findOne({ userId });
        if (!passenger) {
            passenger = await Passenger.create({
                userId,
                name: req.user.fullName,
                phone: req.user.numberPhone
            });
        }

        // 3. Create shuttle request
        const shuttleRequest = await ShuttleRequest.create({
            passengerId: passenger._id,
            ticketCode,
            pickupLocation,
            dropoffLocation,
            direction,
            timeSlot,
            status: "waiting"
        });

        res.status(201).json({
            status: "success",
            data: shuttleRequest
        });
    } catch (error) {
        next(error);
    }
};


exports.getRequestStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const passenger = await Passenger.findOne({ userId });
        if (!passenger) {
            return res.status(404).json({ message: "Passenger not found" });
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
                const stop = trip.route.find(
                    r => r.requestId.toString() === reqItem._id.toString()
                );

                tripInfo = {
                    tripStatus: trip.status,
                    vehicleId: trip.vehicleId,
                    stopOrder: stop?.order || null,
                    stopStatus: stop?.status || null
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
        next(error);
    }
};

// Cancel a request
exports.cancelRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await ShuttleRequest.findById(id);

        if (!request) return res.status(404).json({ message: "Request not found" });

        // Security: Ensure the request belongs to the user
        const passenger = await Passenger.findOne({ userId: req.user.id });
        if (!passenger || request.passengerId.toString() !== passenger._id.toString()) {
            return res.status(403).json({ message: "You don't have permission to cancel this request" });
        }

        if (request.status !== "waiting") {
            return res.status(400).json({ message: "Cannot cancel a request that is already assigned or running" });
        }

        request.status = "cancelled";
        await request.save();

        res.status(200).json({
            status: "success",
            message: "Request cancelled successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Get all pending requests
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
