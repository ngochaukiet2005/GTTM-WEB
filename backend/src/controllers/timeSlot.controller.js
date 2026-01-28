const TimeSlot = require('../models/timeSlot.model');

exports.getAllTimeSlots = async (req, res, next) => {
  try {
    // Lấy tất cả khung giờ đang active, sắp xếp theo thứ tự order tăng dần
    const slots = await TimeSlot.find({ isActive: true }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      results: slots.length,
      data: { slots }
    });
  } catch (error) {
    next(error);
  }
};