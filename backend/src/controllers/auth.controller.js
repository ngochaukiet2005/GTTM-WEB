const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandle");

exports.register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    res.status(200).json(result);
});

exports.resendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await authService.resendOtp(email, purpose || "VERIFY");
    res.status(200).json(result);
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
});

exports.refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json(result);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(200).json(result);
});

exports.logout = asyncHandler(async (req, res) => {
    const result = await authService.logout(req.user.id);
    res.status(200).json(result);
});

exports.changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json(result);
});

exports.getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        status: "success",
        user: req.user
    });
});
