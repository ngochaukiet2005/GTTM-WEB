const admin = require('firebase-admin');
const serviceAccount = require('../configs/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gttm-shuttle-default-rtdb.firebaseio.com" 
  });
}

const db = admin.database();

const FirebaseService = {
  // 1. Cập nhật tọa độ tài xế (Đã có)
  updateDriverLocation: (driverId, lat, lng) => {
    return db.ref(`drivers_location/${driverId}`).set({
      lat,
      lng,
      updatedAt: Date.now()
    });
  },

  // 2. Cập nhật trạng thái điểm dừng (Đã có)
  updateWaypointStatus: (tripId, waypointIndex, status) => {
    return db.ref(`trips_status/${tripId}/waypoints/${waypointIndex}`).update({
      status, // 'waiting', 'picked_up', 'dropped_off' 
      timestamp: Date.now()
    });
  },

  // BỔ SUNG: Khởi tạo lộ trình thực tế lên Firebase sau khi đã tối ưu (Routing)
  initRealtimeTrip: (tripId, driverId, optimizedData) => {
    return db.ref(`trips_status/${tripId}`).set({
      driverId,
      status: 'active',
      currentWaypoint: 0,
      optimizedRoute: optimizedData, // Dữ liệu từ RoutingService
      lastUpdate: Date.now()
    });
  },

  // BỔ SUNG: Lắng nghe yêu cầu mới từ khách hàng (để Server xử lý phân xe)
  listenToNewRequests: (callback) => {
    const requestRef = db.ref('shuttle_requests');
    requestRef.on('child_added', (snapshot) => {
      callback(snapshot.key, snapshot.val());
    });
  }
};

module.exports = FirebaseService;