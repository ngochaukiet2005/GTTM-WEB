const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/user.model");
const TimeSlot = require("../src/models/timeSlot.model");
const Driver = require("../src/models/driver.model");
const Passenger = require("../src/models/passenger.model");
const ShuttleRequest = require("../src/models/shuttleRequest.model");
const Trip = require("../src/models/trip.model");

dotenv.config();

const MONGODB_URI =
  process.env.MONGO_URL || "mongodb://localhost:27017/smart_shuttle";

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await TimeSlot.deleteMany({});
    await Driver.deleteMany({});
    await Passenger.deleteMany({});
    await ShuttleRequest.deleteMany({});
    await Trip.deleteMany({});

    console.log("Cleared existing data");

    // 1. Create Admin User
    const adminUser = await User.create({
      email: "admin@gttm.com",
      password: "admin123",
      fullName: "Admin GTTM",
      numberPhone: "0900000000",
      role: "ADMIN",
      isVerified: true,
    });

    console.log("✅ Created Admin account: admin@gttm.com / admin123");

    // 2. Seed TimeSlots (Khung giờ shuttle bus)
    const startHours = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    const slotsData = startHours.map((startHour, index) => {
        const endHour = startHour + 1;
        const startStr = startHour.toString().padStart(2, '0') + ":00";
        const endStr = endHour.toString().padStart(2, '0') + ":00";

        return {
            time: `${startStr} - ${endStr}`,
            order: index + 1,
            isActive: true
        };
    });

    await TimeSlot.insertMany(slotsData);
    console.log(`✅ Created ${slotsData.length} time slots`);

    console.log("\n--- READY FOR TESTING ---");
    console.log("Admin Email: admin@gttm.com");
    console.log("Admin Password: admin123");
    console.log("\nCreate your own drivers, passengers, and trips as needed.");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
