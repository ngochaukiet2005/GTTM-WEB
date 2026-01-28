// backend/src/controllers/admin.controller.js
const Trip = require("../models/trip.model");
const User = require("../models/user.model");
const Driver = require("../models/driver.model");
const ShuttleRequest = require("../models/shuttleRequest.model");

// GET /api/admin/dashboard-stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Thống kê Chuyến đi (Trips)
        // Tổng số chuyến hôm nay
        const totalTripsToday = await Trip.countDocuments({
            timeSlot: { $gte: today }
        });

        // Tổng số chuyến hôm qua (để tính % tăng giảm)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const totalTripsYesterday = await Trip.countDocuments({
            timeSlot: { $gte: yesterday, $lt: today }
        });

        // 2. Thống kê Khách hàng (Users)
        const totalUsers = await User.countDocuments({ role: "PASSENGER" });
        const newUsersToday = await User.countDocuments({
            role: "PASSENGER",
            createdAt: { $gte: today }
        });

        // 3. Thống kê Tài xế (Drivers)
        const totalDrivers = await Driver.countDocuments();
        const activeDrivers = await Driver.countDocuments({ status: "active" });

        // 4. Thống kê Booking (Requests)
        const totalBookingsToday = await ShuttleRequest.countDocuments({
            createdAt: { $gte: today }
        });

        // 5. Build response theo format giao diện
        // Thay vì tính tiền, ta đếm số lượng Booking
        const bookingsToday = totalBookingsToday;
        const bookingsYesterday = await ShuttleRequest.countDocuments({
            createdAt: { $gte: yesterday, $lt: today }
        });

        res.status(200).json({
            status: "success",
            data: {
                totalTrips: {
                    value: totalTripsToday,
                    change: totalTripsToday - totalTripsYesterday,
                    changeType: totalTripsToday >= totalTripsYesterday ? 'increase' : 'decrease'
                },
                totalUsers: {
                    value: totalUsers,
                    change: newUsersToday,
                    changeType: 'increase' // Luôn tăng
                },
                bookings: { // Đổi tên key từ revenue -> bookings
                    value: bookingsToday,
                    change: bookingsToday - bookingsYesterday,
                    changeType: bookingsToday >= bookingsYesterday ? 'increase' : 'decrease'
                },
                drivers: {
                    total: totalDrivers,
                    active: activeDrivers
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/admin/chart-data (Thống kê 7 ngày gần nhất)
exports.getChartData = async (req, res, next) => {
    try {
        const stats = [];
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const count = await Trip.countDocuments({
                timeSlot: { $gte: date, $lt: nextDate }
            });

            // Format ngày: T2, T3... hoặc 26/01
            days.push(date.toLocaleDateString('vi-VN', { weekday: 'narrow' })); // T2, T3
            stats.push(count);
        }

        res.status(200).json({
            status: "success",
            data: {
                labels: days,
                values: stats
            }
        });

    } catch (error) {
        next(error);
    }
};
