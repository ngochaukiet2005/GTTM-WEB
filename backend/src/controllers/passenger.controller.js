const Passenger = require("../models/passenger.model");

// Verify ticket (Generic check)
exports.verifyTicket = async (req, res, next) => {
    try {
        const { ticketCode } = req.body;

        if (!ticketCode) {
            return res.status(400).json({ message: "Ticket code is required" });
        }

        // Mock verification logic
        // In a real system, you'd check this against the Intercity Bus database
        const isValid = ticketCode.length >= 5;

        if (!isValid) {
            return res.status(400).json({ message: "Invalid or expired ticket code" });
        }

        res.status(200).json({
            status: "success",
            message: "Ticket is valid",
            data: { ticketCode }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const passenger = await Passenger.findOne({ userId: req.user.id });
        if (!passenger) {
            return res.status(404).json({ message: "Passenger profile not found" });
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
        const passenger = await Passenger.findOneAndUpdate(
            { userId: req.user.id },
            { name, phone },
            { new: true, runValidators: true }
        );

        if (!passenger) {
            return res.status(404).json({ message: "Passenger profile not found" });
        }

        res.status(200).json({
            status: "success",
            data: { passenger }
        });
    } catch (error) {
        next(error);
    }
};
