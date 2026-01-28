const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  time: {
    type: String, // Ví dụ: "02:00 - 03:00"
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number, // Dùng để sắp xếp (1, 2, 3...)
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);