const mongoose = require("mongoose");
const { hash, compare } = require("../utils/hash");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
        },
        numberPhone: {
            type: String,
            required: [true, "Number phone is required"],
            trim: true
        },
        gender: {
            type: String,
            enum: ["MALE", "FEMALE"],
            default: "MALE"
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false
        },
        role: {
            type: String,
            enum: ["USER", "DRIVER", "ADMIN"],
            default: "USER"
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String,
            select: false
        },
        otpExpiry: {
            type: Date,
            select: false
        },
        refreshToken: {
            type: String,
            select: false
        }
    },
    {
        timestamps: true
    }
);

// Pre-save middleware to hash password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await hash(this.password);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await compare(candidatePassword, this.password);
};
const User = mongoose.model("User", userSchema);

module.exports = User;
