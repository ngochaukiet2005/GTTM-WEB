const router = require("express").Router();
const passengerController = require("../controllers/passenger.controller");
const { protect } = require("../middlewares/auth.middleware");

// PUBLIC: Xác thực vé không cần đăng nhập
router.post("/verify-ticket", passengerController.verifyTicket);

// PROTECTED: Các route dưới này cần đăng nhập
router.use(protect);
router.get("/profile", passengerController.getProfile);
router.patch("/profile", passengerController.updateProfile);

module.exports = router;