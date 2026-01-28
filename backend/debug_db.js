const mongoose = require('mongoose');
const env = require('./src/configs/env');
const TimeSlot = require('./src/models/timeSlot.model');
const Driver = require('./src/models/driver.model');
const User = require('./src/models/user.model');

async function check() {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_shuttle');
    console.log('Connected to DB');

    const slots = await TimeSlot.find();
    console.log('TimeSlots count:', slots.length);
    if (slots.length > 0) {
        console.log('Sample Slots:', slots.slice(0, 3).map(s => s.time));
    } else {
        console.log('⚠️ NO TIME SLOTS IN DB!');
    }

    const drivers = await Driver.find();
    console.log('Drivers count:', drivers.length);
    for (const d of drivers) {
        console.log(`- Driver: ${d.name}, Status: ${d.status}, UserID: ${d.userId}`);
    }

    const users = await User.find({ role: 'DRIVER' });
    console.log('Users with DRIVER role:', users.length);
    for (const u of users) {
        console.log(`- User: ${u.fullName}, Email: ${u.email}, ID: ${u._id}`);
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
