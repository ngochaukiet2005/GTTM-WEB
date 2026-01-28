require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./src/models/trip.model');
const Driver = require('./src/models/driver.model');

async function checkTripCapacity() {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_shuttle');
        console.log('✅ Connected to DB\n');

        const trips = await Trip.find({ status: { $in: ['ready', 'running'] } })
            .populate('driverId', 'name capacity vehicleId')
            .populate({
                path: 'route.requestId',
                populate: { path: 'passengerId', select: 'name' }
            });

        console.log('📋 KIỂM TRA CAPACITY CỦA CÁC CHUYẾN ĐI:');
        console.log('='.repeat(80));

        trips.forEach((trip, idx) => {
            // Đếm số hành khách UNIQUE (vì mỗi người có 2 điểm)
            const uniquePassengers = new Set();
            trip.route.forEach(stop => {
                if (stop.requestId) {
                    uniquePassengers.add(stop.requestId._id.toString());
                }
            });

            const passengerCount = uniquePassengers.size;
            const driverCapacity = trip.driverId?.capacity || 'N/A';
            const isOverCapacity = passengerCount > driverCapacity;

            console.log(`\n${idx + 1}. Trip ID: ${trip._id}`);
            console.log(`   Tài xế: ${trip.driverId?.name || 'N/A'}`);
            console.log(`   Xe: ${trip.driverId?.vehicleId || 'N/A'}`);
            console.log(`   Capacity: ${driverCapacity} chỗ`);
            console.log(`   Số hành khách: ${passengerCount} người`);
            console.log(`   Số điểm dừng: ${trip.route.length} điểm`);
            console.log(`   Trạng thái: ${trip.status}`);

            if (isOverCapacity) {
                console.log(`   ⚠️  CẢNH BÁO: VƯỢT QUÁ CAPACITY! (${passengerCount}/${driverCapacity})`);
            } else {
                console.log(`   ✅ OK: Trong giới hạn (${passengerCount}/${driverCapacity})`);
            }

            console.log(`\n   Danh sách hành khách:`);
            const passengerList = [];
            trip.route.forEach(stop => {
                if (stop.requestId?.passengerId) {
                    const pName = stop.requestId.passengerId.name || 'Unknown';
                    if (!passengerList.includes(pName)) {
                        passengerList.push(pName);
                    }
                }
            });
            passengerList.forEach((name, i) => {
                console.log(`   ${i + 1}. ${name}`);
            });
        });

        console.log('\n' + '='.repeat(80));
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

checkTripCapacity();
