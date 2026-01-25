const admin = require("firebase-admin");
// Bạn cần tải file serviceAccountKey.json từ Firebase Console
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gttm-smart-shuttle-default-rtdb.asia-southeast1.firebasedatabase.app" 
});

const db = admin.database();
module.exports = db;

// Trong controller xử lý cập nhật trạng thái
const updateTripRealtime = async (tripId, status) => {
    await db.ref(`trips_realtime/${tripId}`).update({
        status: status,
        updatedAt: Date.now()
    });
};