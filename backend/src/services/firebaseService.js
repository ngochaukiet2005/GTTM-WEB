const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});

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