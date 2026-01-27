const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/user.model');
const Driver = require('../src/models/driver.model');
const Passenger = require('../src/models/passenger.model');
const ShuttleRequest = require('../src/models/shuttleRequest.model');
const Trip = require('../src/models/trip.model');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-shuttle';

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Driver.deleteMany({});
        await Passenger.deleteMany({});
        await ShuttleRequest.deleteMany({});
        await Trip.deleteMany({});

        console.log('Cleared existing data');

        // 1. Create Drivers
        const driverUser1 = await User.create({
            email: 'driver1@example.com',
            password: 'password123',
            fullName: 'Nguyen Van Tai Xe 1',
            numberPhone: '0901234561',
            role: 'driver',
            isVerified: true
        });

        const driverUser2 = await User.create({
            email: 'driver2@example.com',
            password: 'password123',
            fullName: 'Le Van Tai Xe 2',
            numberPhone: '0901234562',
            role: 'driver',
            isVerified: true
        });

        await Driver.create([
            {
                userId: driverUser1._id,
                name: driverUser1.fullName,
                phone: driverUser1.numberPhone,
                vehicleId: 'VAN-001',
                capacity: 10,
                status: 'active'
            },
            {
                userId: driverUser2._id,
                name: driverUser2.fullName,
                phone: driverUser2.numberPhone,
                vehicleId: 'VAN-002',
                capacity: 10,
                status: 'active'
            }
        ]);

        // 2. Create 15 Passengers and Requests for the same TimeSlot
        const timeSlot = new Date('2026-02-01T08:00:00Z');
        console.log(`Creating 15 passengers for timeslot: ${timeSlot.toISOString()}`);

        for (let i = 1; i <= 15; i++) {
            const user = await User.create({
                email: `passenger${i}@example.com`,
                password: 'password123',
                fullName: `Hanh Khach ${i}`,
                numberPhone: `09123456${i.toString().padStart(2, '0')}`,
                role: 'passenger',
                isVerified: true
            });

            const passenger = await Passenger.create({
                userId: user._id,
                name: user.fullName,
                phone: user.numberPhone,
                ticketCode: `TIC-100${i}`,
                verified: true
            });

            await ShuttleRequest.create({
                passengerId: passenger._id,
                ticketCode: passenger.ticketCode,
                direction: 'HOME_TO_STATION',
                pickupLocation: `Address ${i}, District ${Math.ceil(i / 5)}`,
                dropoffLocation: 'STATION',
                timeSlot: timeSlot,
                status: 'waiting',
                createdAt: new Date('2026-02-01T07:00:00Z') // Set before cutoff
            });
        }

        console.log('Successfully seeded 2 drivers and 15 passengers with requests.');
        console.log('\n--- HOW TO TEST SMART DISPATCH ---');
        console.log('1. Login as admin or just call the dispatch API:');
        console.log(`   POST /api/trips/dispatch`);
        console.log(`   Body: { "timeSlot": "${timeSlot.toISOString()}" }`);
        console.log('2. EXPECTED RESULT:');
        console.log('   - Trip 1: 10 passengers (Full capacity of Driver 1)');
        console.log('   - Trip 2: 5 passengers (Remaining for Driver 2)');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
