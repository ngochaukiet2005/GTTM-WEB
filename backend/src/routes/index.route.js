const router = require("express").Router();
const authRoute = require("./auth.route");

// Mount sub-routers
router.use("/auth", authRoute);

module.exports = router;
