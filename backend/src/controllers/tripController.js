const FirebaseService = require('../services/firebaseService');
const RoutingService = require('../services/routingService');
const TripModel = require('../models/Trip'); // MongoDB 

exports.createTrip = async (req, res) => {
  try {
    const { bookings, startTime } = req.body; // Gom đơn trong khung giờ 
    
    // 1. Lấy tọa độ từ bookings
    const destinations = bookings.map(b => b.location);
    const station = { lat: 10.8231, lng: 106.6297 }; // Ví dụ tọa độ bến

    // 2. Gọi thuật toán tối ưu [cite: 65]
    const optimizedData = await RoutingService.optimizeTrip(station, destinations);

    // 3. Lưu vào MongoDB để quản lý lịch sử 
    const newTrip = await TripModel.create({
      waypoints: optimizedData.routes[0].optimizedIntermediateWaypointIndex,
      status: 'Đang chờ',
      startTime
    });

    // 4. Đẩy lên Firebase để đồng bộ Realtime cho Driver/Admin 
    await FirebaseService.updateWaypointStatus(newTrip._id, 0, 'initialized');

    res.status(201).json(newTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};