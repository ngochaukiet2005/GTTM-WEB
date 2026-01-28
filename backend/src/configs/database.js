const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    if (
      !env.mongoUrl ||
      typeof env.mongoUrl !== "string" ||
      !env.mongoUrl.trim()
    ) {
      throw new Error(
        "Missing MongoDB URI. Set MONGO_URL in backend/.env or provide MONGODB_URI/MONGO_URI.",
      );
    }
    await mongoose.connect(env.mongoUrl);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
