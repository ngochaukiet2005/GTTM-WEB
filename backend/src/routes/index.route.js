const router = require("express").Router();
const authRoute = require("./auth.route");
const passengerRoute = require("./passenger.route");
const ticketRoute = require("./ticket.route");
const tripRoute = require("./trip.route");
const driverRoute = require("./driver.route");
const tripsRoute = require("./trips.route");

// Mount sub-routers
router.use("/auth", authRoute);
router.use("/passenger", passengerRoute);
router.use("/shuttle-request", ticketRoute);
router.use("/trip", tripRoute);
router.use("/driver", driverRoute);
router.use("/trips", tripsRoute);

module.exports = router;
