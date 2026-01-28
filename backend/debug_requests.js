const mongoose = require('mongoose');
const ShuttleRequest = require('./src/models/shuttleRequest.model');
const Trip = require('./src/models/trip.model');
const Driver = require('./src/models/driver.model');

async function debug() {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_shuttle');
    console.log('Connected to DB');

    const requests = await ShuttleRequest.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n--- LATEST SHUTTLE REQUESTS ---');
    requests.forEach(r => {
        console.log(`ID: ${r._id}, Ticket: ${r.ticketCode}, Status: ${r.status}, TripID: ${r.tripId || 'None'}, CreatedAt: ${r.createdAt}`);
    });

    const trips = await Trip.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n--- LATEST TRIPS ---');
    trips.forEach(t => {
        console.log(`ID: ${t._id}, DriverID: ${t.driverId}, Status: ${t.status}, TimeSlot: ${t.timeSlot}, CreatedAt: ${t.createdAt}`);
    });

    const drivers = await Driver.find();
    console.log('\n--- DRIVERS STATUS ---');
    drivers.forEach(d => {
        console.log(`Name: ${d.name}, Status: ${d.status}`);
    });

    process.exit(0);
}

debug().catch(err => {
    console.error(err);
    process.exit(1);
});
