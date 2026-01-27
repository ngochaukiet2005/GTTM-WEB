const router = require("express").Router();
const passengerController = require("../controllers/passenger.controller");
const { protect } = require("../middlewares/auth.middleware");

// Passenger profile & verification
router.get("/profile", protect, passengerController.getProfile);
router.patch("/profile", protect, passengerController.updateProfile);
router.post("/verify-ticket", protect, passengerController.verifyTicket);

module.exports = router;
