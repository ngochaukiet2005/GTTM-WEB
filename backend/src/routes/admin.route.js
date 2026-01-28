// backend/src/routes/admin.route.js
const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const tripController = require("../controllers/tripController"); // Import tripController
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// Tất cả routes admin đều cần protect và role ADMIN
router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/chart-data", adminController.getChartData);
router.get("/trips", tripController.getAllTrips); // 🔥 Thêm route lấy tất cả chuyến đi cho Admin

module.exports = router;
