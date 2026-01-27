require("dotenv").config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoUrl: process.env.MONGO_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
};

