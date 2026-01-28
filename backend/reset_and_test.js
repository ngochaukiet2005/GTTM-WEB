// reset_and_test.js
// Script này sẽ reset database và tạo dữ liệu test mới để verify logic V2

require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./src/models/trip.model');
const ShuttleRequest = require('./src/models/shuttleRequest.model');
const Driver = require('./src/models/driver.model');
const Passenger = require('./src/models/passenger.model');
const User = require('./src/models/user.model');
const dispatchService = require('./src/services/dispatch.service.v2'); // Sử dụng V2

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_shuttle');
        console.log('✅ Connected to DB\n');

        // 1. CLEANUP
        console.log('🧹 Clearing old data...');
        await Trip.deleteMany({});
        await ShuttleRequest.deleteMany({});
        // Giữ lại Drivers và Users để không phải login lại

        // Reset driver status
        await Driver.updateMany({}, { status: 'active' });
        console.log('✅ Data cleared & Drivers reset');

        // 2. TẠO REQUESTS TEST
        // Lấy 1 passenger mẫu
        const passenger = await Passenger.findOne();
        if (!passenger) {
            console.error('❌ Không tìm thấy passenger nào. Vui lòng tạo user passenger trước.');
            process.exit(1);
        }

        console.log(`\n📦 Creating test bookings for Passenger: ${passenger.userId}`);

        const now = new Date();
        // Set timeSlot = 1 tiếng sau
        const timeSlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);

        const testRequests = [
            {
                pickupLocation: "123 Nguyễn Văn Linh, Q7",
                dropoffLocation: "Bến xe Miền Tây",
                direction: "HOME_TO_STATION"
            },
            {
                pickupLocation: "456 Lê Văn Lương, Q7",
                dropoffLocation: "Bến xe Miền Tây",
                direction: "HOME_TO_STATION"
            },
            {
                pickupLocation: "789 Huỳnh Tấn Phát, Q7",
                dropoffLocation: "Bến xe Miền Tây",
                direction: "HOME_TO_STATION"
            },
            {
                pickupLocation: "Bến xe Miền Tây",
                dropoffLocation: "101 Nguyễn Hữu Thọ, Nhà Bè",
                direction: "STATION_TO_HOME"
            }
        ];

        for (const req of testRequests) {
            await ShuttleRequest.create({
                passengerId: passenger._id,
                ticketCode: `TEST-${Math.floor(Math.random() * 10000)}`,
                pickupLocation: req.pickupLocation,
                dropoffLocation: req.dropoffLocation,
                direction: req.direction,
                timeSlot: timeSlot,
                status: 'waiting',
                paymentStatus: 'paid'
            });
        }
        console.log(`✅ Created ${testRequests.length} test requests`);

        // 3. RUN AUTO DISPATCH
        console.log('\n🚀 Running Auto Dispatch inside script...');
        const result = await dispatchService.autoDispatch(timeSlot);

        if (result.success && result.trips.length > 0) {
            console.log(`\n✨ SUCCESS! Trip created with ID: ${result.trips[0]._id}`);
            console.log(`👉 Please verify in Driver App (Login with an active driver account)`);
        } else {
            console.error('\n❌ FAILED to create trip:', result.message);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
