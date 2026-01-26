const admin = require('firebase-admin');
const serviceAccount = require('../configs/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gttm-shuttle-default-rtdb.firebaseio.com" // Use your real RTDB URL
  });
}

const db = admin.database();

const FirebaseService = {
  // CN-TX-04: Cập nhật tọa độ tài xế mỗi 5s 
  updateDriverLocation: (driverId, lat, lng) => {
    return db.ref(`drivers_location/${driverId}`).set({
      lat,
      lng,
      updatedAt: Date.now()
    });
  },

  // CN-HT-02: Đồng bộ trạng thái từng điểm dừng 
  updateWaypointStatus: (tripId, waypointIndex, status) => {
    return db.ref(`trips_status/${tripId}/waypoints/${waypointIndex}`).update({
      status, // 'waiting', 'picked_up', 'dropped_off' 
      timestamp: Date.now()
    });
  }
};

module.exports = FirebaseService;