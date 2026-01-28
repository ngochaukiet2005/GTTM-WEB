const User = require("../models/user.model");
const AppError = require("../utils/appError");
const jwtUtils = require("../utils/jwt");
const otpUtils = require("../utils/otp");
const hashUtils = require("../utils/hash");
const emailService = require("./email.service");

class AuthService {
    async register(userData) {
        const { email, password, confirmPassword, fullName, numberPhone, gender } = userData;

        if (password !== confirmPassword) {
            throw new AppError("Passwords do not match", 400);
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { numberPhone }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new AppError("Email already registered", 400);
            }
            throw new AppError("Phone number already registered", 400)
        }

        const otp = otpUtils.generateOtp();
        const hashedOtp = await otpUtils.hashOtp(otp);

        const user = await User.create({
            email,
            password,
            fullName,
            numberPhone,
            gender,
            otp: hashedOtp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        await emailService.sendOtp(email, otp, "VERIFY");

        return {
            message: "User registered. Please verify your email with the OTP sent.",
            userId: user._id
        };
    }

    async verifyEmail(email, otp) {
        const user = await User.findOne({ email }).select("+otp +otpExpiry");
        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.isVerified) {
            throw new AppError("Email already verified", 400);
        }

        if (new Date() > user.otpExpiry) {
            throw new AppError("OTP expired", 400);
        }

        // Using hash utility for OTP matching
        const isOtpMatch = await hashUtils.compare(otp, user.otp);
        if (!isOtpMatch) {
            throw new AppError("Invalid OTP", 400);
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return { message: "Email verified successfully" };
    }

    async resendOtp(email, purpose) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (purpose === "VERIFY" && user.isVerified) {
            throw new AppError("Email already verified", 400);
        }

        const otp = otpUtils.generateOtp();
        const hashedOtp = await otpUtils.hashOtp(otp);

        user.otp = hashedOtp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await emailService.sendOtp(email, otp, purpose);

        return { message: "OTP resent successfully" };
    }

    async login(identifier, password) {
        // Find user by email OR numberPhone
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { numberPhone: identifier }
            ]
        }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
            throw new AppError("Invalid credentials", 401);
        }

        if (!user.isVerified) {
            throw new AppError("Please verify your email first", 403);
        }

        const accessToken = jwtUtils.generateAccessToken(user._id);
        const refreshToken = jwtUtils.generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                numberPhone: user.numberPhone,
                gender: user.gender,
                role: user.role
            }
        };
    }

    async refresh(oldRefreshToken) {
        try {
            const decoded = jwtUtils.verifyRefreshToken(oldRefreshToken);
            const user = await User.findById(decoded.id).select("+refreshToken");

            if (!user || user.refreshToken !== oldRefreshToken) {
                throw new AppError("Invalid refresh token", 401);
            }

            const accessToken = jwtUtils.generateAccessToken(user._id);
            const newRefreshToken = jwtUtils.generateRefreshToken(user._id);

            user.refreshToken = newRefreshToken;
            await user.save();

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new AppError("Invalid refresh token", 401);
        }
    }

    async logout(userId) {
        await User.findByIdAndUpdate(userId, { refreshToken: undefined });
        return { message: "Logged out successfully" };
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId).select("+password");
        if (!user || !(await user.comparePassword(oldPassword))) {
            throw new AppError("Current password is incorrect", 401);
        }

        user.password = newPassword;
        await user.save();

        return { message: "Password updated successfully" };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError("User with this email does not exist", 404);
        }

        const otp = otpUtils.generateOtp();
        const hashedOtp = await otpUtils.hashOtp(otp);

        user.otp = hashedOtp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await emailService.sendOtp(email, otp, "RESET");

        return { message: "OTP sent to your email" };
    }

    async resetPassword(email, otp, newPassword) {
        const user = await User.findOne({ email }).select("+otp +otpExpiry");
        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (new Date() > user.otpExpiry) {
            throw new AppError("OTP expired", 400);
        }

        const isOtpMatch = await hashUtils.compare(otp, user.otp);
        if (!isOtpMatch) {
            throw new AppError("Invalid OTP", 400);
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return { message: "Password reset successfully" };
    }
}

module.exports = new AuthService();
