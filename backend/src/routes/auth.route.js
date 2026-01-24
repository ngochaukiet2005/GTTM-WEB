const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const router = require("express").Router();

router.post("/register", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-otp", authController.resendOtp);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.use(protect);
router.post("/logout", authController.logout);
router.post("/change-password", authController.changePassword);

module.exports = router;
