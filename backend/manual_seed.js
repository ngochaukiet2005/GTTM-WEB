const mongoose = require('mongoose');
const seedData = require('./src/services/seedService');
const env = require('./src/configs/env');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_shuttle');
        console.log('Connected to DB for manual seed');
        await seedData();
        console.log('Seed completed');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
