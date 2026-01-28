const mongoose = require("mongoose");

const shuttleRequestSchema = new mongoose.Schema(
    {
        passengerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Passenger",
            required: true
        },
        ticketCode: {
            type: String,
            required: true,
            trim: true
        },
        direction: {
            type: String,
            enum: ["HOME_TO_STATION", "STATION_TO_HOME"],
            required: true
        },
        pickupLocation: {
            type: String,
            required: true
        },
        dropoffLocation: {
            type: String,
            required: true
        },
        timeSlot: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            // Đã thêm "cancelled" vào danh sách bên dưới
            enum: ["waiting", "assigned", "running", "completed", "no_show", "cancelled"],
            default: "waiting"
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip"
        }
    },
    {
        timestamps: true
    }
);

const ShuttleRequest = mongoose.model("ShuttleRequest", shuttleRequestSchema);

module.exports = ShuttleRequest;