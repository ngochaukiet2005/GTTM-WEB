const router = require("express").Router();
const authRoute = require("./auth.route");
const passengerRoute = require("./passenger.route");
const ticketRoute = require("./ticket.route");
const tripRoute = require("./trip.route");

// Mount sub-routers
router.use("/auth", authRoute);
router.use("/passenger", passengerRoute);
router.use("/shuttle-request", ticketRoute); // Usually mounted as /shuttle-request or /ticket
router.use("/trip", tripRoute);

module.exports = router;
