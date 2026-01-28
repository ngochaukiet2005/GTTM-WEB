const jwtUtils = require("../utils/jwt");
const User = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandle");

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access.", 401));
    }

    try {
        const decoded = jwtUtils.verifyAccessToken(token);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next(new AppError("The user belonging to this token no longer exists.", 401));
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return next(new AppError("Invalid token or token expired", 401));
    }
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Normalize roles to uppercase for comparison
        const normalizedRoles = roles.map(r => r.toUpperCase());
        const userRole = req.user.role ? req.user.role.toUpperCase() : "";
        
        if (!normalizedRoles.includes(userRole)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};
