const db = require('../configs/firebase');

// Hàm tính khoảng cách giữa 2 tọa độ (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const findNearestDriver = async (passengerLat, passengerLng) => {
    const driversRef = db.ref('drivers');
    // Lấy tất cả tài xế đang online
    const snapshot = await driversRef.orderByChild('status').equalTo('online').once('value');
    const drivers = snapshot.val();

    if (!drivers) return null;

    let nearestDriverId = null;
    let minDistance = Infinity;

    Object.keys(drivers).forEach(id => {
        const driver = drivers[id];
        const dist = calculateDistance(passengerLat, passengerLng, driver.lat, driver.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestDriverId = id;
        }
    });

    return nearestDriverId;
};

module.exports = { findNearestDriver };