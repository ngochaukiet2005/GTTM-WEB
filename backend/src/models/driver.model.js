const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        vehicleId: {
            type: String,
            required: true
        },
        capacity: {
            type: Number,
            default: 16 // Default shuttle van capacity
        },
        status: {
            type: String,
            enum: ["active", "inactive", "on_trip"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
