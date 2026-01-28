require("dotenv").config();

// Prefer MONGO_URL, fallback to common aliases and sensible local default
const resolvedMongoUrl =
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/smart_shuttle";

if (!process.env.MONGO_URL) {
  console.warn(
    "[env] MONGO_URL not set in .env — using default: mongodb://localhost:27017/smart_shuttle",
  );
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUrl: resolvedMongoUrl,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};
