const router = require("express").Router();
const shuttleRequestController = require("../controllers/shuttleRequest.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// Customer flow
router.post("/request", protect, shuttleRequestController.createRequest);
router.get("/status", protect, shuttleRequestController.getRequestStatus);
router.patch("/:id/cancel", protect, shuttleRequestController.cancelRequest);

// Admin flow
router.get("/admin/pending", protect, restrictTo("admin"), shuttleRequestController.getAllPendingRequests);

module.exports = router;
