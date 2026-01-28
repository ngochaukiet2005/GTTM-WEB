const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
    {
        vehicleId: {
            type: String,
            required: true
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },
        timeSlot: {
            type: Date,
            required: true
        },
        // 🔥 Thêm location trực tiếp để dễ query + sync với passenger
        pickupLocation: {
            type: String,
            required: false // Không bắt buộc vì đã có route chi tiết
        },
        dropoffLocation: {
            type: String,
            required: false // Không bắt buộc vì đã có route chi tiết
        },
        route: [
            {
                requestId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "ShuttleRequest",
                    required: true
                },
                location: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    enum: ["pickup", "dropoff"],
                    required: true
                },
                order: {
                    type: Number,
                    required: true
                },
                status: {
                    type: String,
                    enum: ["pending", "picked_up", "dropped_off", "no_show"],
                    default: "pending"
                }
            }
        ],
        status: {
            type: String,
            enum: ["ready", "running", "completed"],
            default: "ready"
        }
    },
    {
        timestamps: true
    }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
