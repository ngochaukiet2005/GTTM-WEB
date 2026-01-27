const router = require("express").Router();
const tripController = require("../controllers/tripController");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// Admin/Dispatcher routes
router.use(protect);
router.use(restrictTo("admin", "driver"));

router.get("/", tripController.getAllTrips);
router.get("/:id", tripController.getTripById);
router.post("/create", tripController.createTrip);
router.post("/dispatch", tripController.dispatchTrips);
router.patch("/stop-status", tripController.updateStopStatus);

module.exports = router;
