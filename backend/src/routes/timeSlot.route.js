const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlot.controller');

// GET /api/timeslots
router.get('/', timeSlotController.getAllTimeSlots);

module.exports = router;