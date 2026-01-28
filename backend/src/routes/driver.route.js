// backend/src/routes/driver.route.js
const router = require("express").Router();
const tripController = require("../controllers/tripController");
const driverController = require("../controllers/driver.controller"); // <-- Đảm bảo dòng này có
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// --- 1. ADMIN ROUTES (QUAN TRỌNG: Đặt trên cùng) ---
// Admin có quyền quản lý tài xế
router.get("/admin/all", protect, restrictTo("ADMIN"), driverController.getAllDrivers);
router.post("/admin/create", protect, restrictTo("ADMIN"), driverController.createDriver);
router.patch("/admin/:id/toggle", protect, restrictTo("ADMIN"), driverController.toggleDriverStatus);
router.delete("/admin/:id", protect, restrictTo("ADMIN"), driverController.deleteDriver);

// --- 2. DRIVER APP ROUTES (Dành riêng cho App Tài xế) ---
// Các dòng dưới đây sẽ chặn tất cả user không phải là DRIVER
router.use(protect);
router.use(restrictTo("DRIVER"));

router.get("/trips", tripController.getAllTrips);
router.get("/trips/:id", tripController.getTripById);
router.patch("/trips/:tripId/stop/:requestId", tripController.updateStopStatus);

module.exports = router;