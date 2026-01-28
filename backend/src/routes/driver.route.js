// backend/src/routes/driver.route.js
const router = require("express").Router();
const tripController = require("../controllers/tripController");
const driverController = require("../controllers/driver.controller"); // <-- Quan trọng: Import controller này
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// --- PHẦN 1: ADMIN ROUTES (QUẢN LÝ TÀI XẾ) ---
// Phải đặt LÊN TRÊN dòng restrictTo("DRIVER") để Admin truy cập được
router.get("/admin/all", protect, restrictTo("ADMIN"), driverController.getAllDrivers);
router.post("/admin/create", protect, restrictTo("ADMIN"), driverController.createDriver);
router.patch("/admin/:id/toggle", protect, restrictTo("ADMIN"), driverController.toggleDriverStatus);
router.delete("/admin/:id", protect, restrictTo("ADMIN"), driverController.deleteDriver);

// --- PHẦN 2: DRIVER APP ROUTES (DÀNH CHO TÀI XẾ) ---
// Các route bên dưới sẽ chỉ dành cho DRIVER
router.use(protect);
router.use(restrictTo("DRIVER"));

router.get("/trips", tripController.getAllTrips);
router.get("/trips/:id", tripController.getTripById);
router.patch("/trips/:tripId/stop/:requestId", tripController.updateStopStatus);

module.exports = router;