const router = require("express").Router();
const tripController = require("../controllers/tripController");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// Driver-specific routes - require driver role
router.use(protect);
router.use(restrictTo("DRIVER"));

// Get all trips for current driver
router.get("/trips", tripController.getAllTrips);

// Get specific trip details
router.get("/trips/:id", tripController.getTripById);

// Update stop status (pickup, dropoff, no_show)
router.patch("/trips/:tripId/stop/:requestId", tripController.updateStopStatus);

module.exports = router;
