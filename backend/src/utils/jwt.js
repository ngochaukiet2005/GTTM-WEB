const jwt = require("jsonwebtoken");
const env = require("../configs/env");

exports.generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, env.jwtSecret, {
        expiresIn: "15m"
    });
};

exports.generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, env.jwtRefreshSecret, {
        expiresIn: "7d"
    });
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, env.jwtSecret);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, env.jwtRefreshSecret);
};
