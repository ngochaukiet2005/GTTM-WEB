// src/core/services/mockApiDriver.js

// --- DỮ LIỆU GIẢ LẬP ---
const DRIVER_DB = {
    info: {
        id: "d1",
        name: "Trần Tài Xế",
        plate: "59X1-999.99",
        phone: "0909123456",
        avatar: "https://ui-avatars.com/api/?name=Tran+Tai+Xe&background=0D8ABC&color=fff&size=128",
        rating: 4.9,
    },
    // Danh sách hành khách đặt chỗ (Booking Requests)
    bookings: [
        {
            id: "b1",
            passenger: { name: "Nguyễn Văn A", phone: "0901xxx", avatar: "https://ui-avatars.com/api/?name=A&bg=red" },
            address: "123 Lê Lợi, Q1",
            lat: 10.7769, lng: 106.7009,
            timeSlot: "06:00 - 08:00", // Khung giờ dạng khoảng
            status: "pending", // pending, accepted, rejected
            timestamp: new Date().getTime() // Để tính time-out 10p
        },
        {
            id: "b2",
            passenger: { name: "Trần Thị B", phone: "0902xxx", avatar: "https://ui-avatars.com/api/?name=B&bg=green" },
            address: "456 Nguyễn Trãi, Q5",
            lat: 10.7550, lng: 106.6650,
            timeSlot: "06:00 - 08:00",
            status: "accepted",
            timestamp: new Date().getTime()
        },
        {
            id: "b3",
            passenger: { name: "Lê Văn C", phone: "0903xxx", avatar: "https://ui-avatars.com/api/?name=C&bg=blue" },
            address: "789 Kinh Dương Vương",
            lat: 10.7423, lng: 106.6138,
            timeSlot: "08:00 - 10:00",
            status: "pending",
            timestamp: new Date().getTime()
        }
    ]
};

const simulateNetwork = (cb) => new Promise(resolve => setTimeout(() => resolve(cb()), 500));

export const mockDriverService = {
    getDriverProfile: async () => simulateNetwork(() => DRIVER_DB.info),

    // Lấy danh sách booking, gom nhóm theo TimeSlot
    getBookingsBySlots: async () => simulateNetwork(() => {
        // Giả lập logic Auto-Reject sau 10p (ở đây demo luôn reject nếu status pending quá lâu)
        // Code thực tế sẽ check timestamp

        // Group by TimeSlot
        const slots = {};
        DRIVER_DB.bookings.forEach(booking => {
            if (!slots[booking.timeSlot]) slots[booking.timeSlot] = [];
            slots[booking.timeSlot].push(booking);
        });
        return slots;
    }),

    // Tài xế Chấp nhận/Từ chối khách
    reviewBooking: async (bookingId, action) => simulateNetwork(() => {
        const booking = DRIVER_DB.bookings.find(b => b.id === bookingId);
        if (!booking) throw new Error("Không tìm thấy đơn!");
        
        // Check full xe (16 chỗ)
        if (action === 'accepted') {
            const currentSlotCount = DRIVER_DB.bookings.filter(b => b.timeSlot === booking.timeSlot && b.status === 'accepted').length;
            if (currentSlotCount >= 16) throw new Error("Xe đã đầy (16/16)!");
        }

        booking.status = action; // 'accepted' hoặc 'rejected'
        return booking;
    }),

    // Bắt đầu chuyến đi -> Trả về Lộ Trình Tối Ưu (Sorted Route)
    startOptimizedTrip: async (timeSlot) => simulateNetwork(() => {
        const passengers = DRIVER_DB.bookings.filter(b => b.timeSlot === timeSlot && b.status === 'accepted');
        
        if (passengers.length === 0) throw new Error("Chưa có khách nào được duyệt trong khung giờ này!");

        // --- GIẢ LẬP THUẬT TOÁN TỐI ƯU ---
        // Sắp xếp điểm nào gần Bến (Station) nhất thì đi trước, xa thì đi sau
        // Thực tế sẽ dùng Google Distance Matrix API
        const stationLat = 10.742336; 
        const sortedRoute = passengers.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.lat - stationLat, 2));
            const distB = Math.sqrt(Math.pow(b.lat - stationLat, 2));
            return distA - distB; // Gần bến xếp trước
        });

        return {
            timeSlot,
            station: { lat: 10.742336, lng: 106.613876, address: "Bến xe Miền Tây" },
            route: sortedRoute
        };
    })
};