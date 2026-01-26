const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: [true, "Passenger name is required"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Passenger = mongoose.model("Passenger", passengerSchema);

module.exports = Passenger;
