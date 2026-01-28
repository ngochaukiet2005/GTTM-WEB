const express = require("express");
const authRoute = require("./auth.route");
const passengerRoute = require("./passenger.route");
const driverRoute = require("./driver.route");
const tripRoute = require("./trip.route"); 
const tripsRoute = require("./trips.route");
const ticketRoute = require("./ticket.route");
const timeSlotRoute = require("./timeSlot.route"); // <--- (1) Import mới

const router = express.Router();

router.use("/auth", authRoute);
router.use("/passenger", passengerRoute);
router.use("/driver", driverRoute);
router.use("/trips", tripsRoute); 
router.use("/tickets", ticketRoute);
router.use("/timeslots", timeSlotRoute); // <--- (2) Sử dụng route mới

module.exports = router;