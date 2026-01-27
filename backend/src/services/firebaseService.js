const db = require('../configs/firebase');

const FirebaseService = {
  // Initialize trip data in Realtime Database
  initializeTrip: async (tripId, driverId, vehicleId, waypoints) => {
    try {
      await db.ref(`trips_realtime/${tripId}`).set({
        driverId,
        vehicleId,
        status: 'ready',
        currentWaypointIndex: 0,
        updatedAt: Date.now()
      });

      // Initialize waypoints status
      const waypointsData = {};
      waypoints.forEach((wp, index) => {
        waypointsData[index] = {
          requestId: wp.requestId,
          location: wp.location,
          type: wp.type,
          status: 'pending',
          order: wp.order
        };
      });

      await db.ref(`trips_realtime/${tripId}/waypoints`).set(waypointsData);
    } catch (error) {
      console.error('Firebase initializeTrip error:', error);
      throw error;
    }
  },

  // CN-TX-04: Cập nhật tọa độ tài xế mỗi 5s 
  updateDriverLocation: async (driverId, lat, lng) => {
    try {
      return await db.ref(`drivers_location/${driverId}`).set({
        lat,
        lng,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Firebase updateDriverLocation error:', error);
    }
  },

  // CN-HT-02: Đồng bộ trạng thái từng điểm dừng 
  updateWaypointStatus: async (tripId, waypointIndex, status) => {
    try {
      return await db.ref(`trips_realtime/${tripId}/waypoints/${waypointIndex}`).update({
        status, // 'pending', 'picked_up', 'dropped_off', 'no_show' 
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Firebase updateWaypointStatus error:', error);
    }
  },

  // Update overall trip status
  updateTripStatus: async (tripId, status) => {
    try {
      return await db.ref(`trips_realtime/${tripId}`).update({
        status, // 'ready', 'running', 'completed'
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Firebase updateTripStatus error:', error);
    }
  }
};

module.exports = FirebaseService;
