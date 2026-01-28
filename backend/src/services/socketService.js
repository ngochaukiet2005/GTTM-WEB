// Service này giúp Controller gọi Socket.io dễ dàng hơn

const SocketService = {
  // Lấy instance IO từ app (cần truyền req.app.get('socketio') vào hàm này)
  
  // CN-TX-04: Cập nhật tọa độ tài xế
  // Thay vì lưu vào Firebase, ta bắn sự kiện socket
  emitDriverLocation: (io, driverId, lat, lng) => {
    // Kênh: driver_location_{driverId}
    io.emit(`driver_location_${driverId}`, {
        lat, 
        lng,
        updatedAt: Date.now()
    });
  },

  // Cập nhật trạng thái chuyến đi
  emitTripStatus: (io, tripId, status) => {
    io.emit(`trip_status_${tripId}`, { status });
  },

  // Cập nhật trạng thái điểm dừng
  emitWaypointStatus: (io, tripId, waypointIndex, status) => {
    io.emit(`trip_waypoint_${tripId}`, { 
        index: waypointIndex, 
        status 
    });
  }
};

module.exports = SocketService;