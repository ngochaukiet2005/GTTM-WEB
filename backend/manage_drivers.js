require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Driver = require('./src/models/driver.model');

async function listAndCreateDrivers() {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_shuttle');
        console.log('✅ Connected to DB\n');

        // 1. Liệt kê tất cả drivers hiện có
        const drivers = await Driver.find().populate('userId', 'fullName email');
        console.log('📋 DANH SÁCH TÀI XẾ HIỆN TẠI:');
        console.log('='.repeat(60));
        drivers.forEach((driver, idx) => {
            console.log(`${idx + 1}. ${driver.name || driver.userId?.fullName}`);
            console.log(`   Email: ${driver.userId?.email}`);
            console.log(`   Vehicle: ${driver.vehicleId}`);
            console.log(`   Status: ${driver.status}`);
            console.log(`   Capacity: ${driver.capacity}`);
            console.log('');
        });

        // 2. Tạo thêm 2 tài xế mới nếu chưa có
        const driverAccounts = [
            { email: 'driver1@gttm.com', name: 'Nguyễn Văn A', vehicle: 'BUS-001', password: 'driver123' },
            { email: 'driver2@gttm.com', name: 'Trần Văn B', vehicle: 'BUS-002', password: 'driver123' },
            { email: 'driver3@gttm.com', name: 'Lê Văn C', vehicle: 'BUS-003', password: 'driver123' }
        ];

        console.log('\n🔧 TẠO TÀI KHOẢN TÀI XẾ MỚI:');
        console.log('='.repeat(60));

        for (const acc of driverAccounts) {
            let user = await User.findOne({ email: acc.email });

            if (!user) {
                user = await User.create({
                    fullName: acc.name,
                    email: acc.email,
                    numberPhone: '0987654321',
                    password: acc.password,
                    role: 'DRIVER',
                    isVerified: true,
                    gender: 'MALE'
                });
                console.log(`✅ Tạo User: ${acc.email}`);
            } else {
                console.log(`ℹ️  User đã tồn tại: ${acc.email}`);
            }

            let driver = await Driver.findOne({ userId: user._id });
            if (!driver) {
                driver = await Driver.create({
                    userId: user._id,
                    name: acc.name,
                    phone: '0987654321',
                    vehicleId: acc.vehicle,
                    capacity: 16,
                    status: 'active'
                });
                console.log(`✅ Tạo Driver profile: ${acc.name} (${acc.vehicle})`);
            } else {
                console.log(`ℹ️  Driver profile đã tồn tại: ${acc.name}`);
            }
            console.log('');
        }

        console.log('\n📋 THÔNG TIN ĐĂNG NHẬP:');
        console.log('='.repeat(60));
        driverAccounts.forEach(acc => {
            console.log(`Email: ${acc.email}`);
            console.log(`Password: ${acc.password}`);
            console.log(`Vehicle: ${acc.vehicle}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

listAndCreateDrivers();
