// src/core/services/mockApiDriver.js

// --- DỮ LIỆU GIẢ LẬP ---
const DRIVER_DB = {
    info: {
        id: "d1",
        name: "Trần Tài Xế",
        plate: "59X1-999.99",
        phone: "0909123456",
        email: "taixe.tran@example.com", 
        gender: "male", // 👈 Đã thêm giới tính
        avatar: "https://ui-avatars.com/api/?name=Tran+Tai+Xe&background=0D8ABC&color=fff&size=128",
        rating: 4.9,
        // 👇 Dữ liệu lộ trình mặc định (khớp với Dropdown)
        stationStart: "Bến xe Miền Tây",
        stationEnd: "Đại học Quốc Gia TP.HCM"
    },
    bookings: [
        {
            id: "b1",
            passenger: { name: "Nguyễn Văn A", phone: "0901xxx", avatar: "https://ui-avatars.com/api/?name=A&bg=red" },
            address: "123 Lê Lợi, Q1",
            lat: 10.7769, lng: 106.7009,
            timeSlot: "06:00 - 07:00",
            status: "pending",
            timestamp: new Date().getTime()
        },
        {
            id: "b2",
            passenger: { name: "Trần Thị B", phone: "0902xxx", avatar: "https://ui-avatars.com/api/?name=B&bg=green" },
            address: "456 Nguyễn Trãi, Q5",
            lat: 10.7550, lng: 106.6650,
            timeSlot: "06:00 - 07:00",
            status: "accepted",
            timestamp: new Date().getTime()
        },
        {
            id: "b3",
            passenger: { name: "Lê Văn C", phone: "0903xxx", avatar: "https://ui-avatars.com/api/?name=C&bg=blue" },
            address: "789 Kinh Dương Vương",
            lat: 10.7423, lng: 106.6138,
            timeSlot: "08:00 - 09:00",
            status: "pending",
            timestamp: new Date().getTime()
        }
    ]
};

const simulateNetwork = (cb) => new Promise(resolve => setTimeout(() => resolve(cb()), 500));

export const mockDriverService = {
    // 1. Lấy thông tin tài xế
    getDriverProfile: async () => simulateNetwork(() => DRIVER_DB.info),

    // 2. Cập nhật thông tin tài xế & lộ trình
    updateDriverProfile: async (newInfo) => simulateNetwork(() => {
        // Merge thông tin mới vào DB
        DRIVER_DB.info = { ...DRIVER_DB.info, ...newInfo };
        return DRIVER_DB.info;
    }),

    // 3. Lấy danh sách booking (gom nhóm theo Slot)
    getBookingsBySlots: async () => simulateNetwork(() => {
        const slots = {};
        DRIVER_DB.bookings.forEach(booking => {
            if (!slots[booking.timeSlot]) slots[booking.timeSlot] = [];
            slots[booking.timeSlot].push(booking);
        });
        return slots;
    }),

    // 4. Duyệt/Từ chối booking
    reviewBooking: async (bookingId, action) => simulateNetwork(() => {
        const booking = DRIVER_DB.bookings.find(b => b.id === bookingId);
        if (!booking) throw new Error("Không tìm thấy đơn!");
        booking.status = action;
        return booking;
    }),

    // 5. Bắt đầu chuyến đi (Tính toán lộ trình tối ưu)
    startOptimizedTrip: async (timeSlot) => simulateNetwork(() => {
        const passengers = DRIVER_DB.bookings.filter(b => b.timeSlot === timeSlot && b.status === 'accepted');
        
        // Demo: Nếu không có khách nào accepted, ta fake luôn 1 vài khách để test cho dễ
        let routeData = passengers;
        if (passengers.length === 0) {
             routeData = [
                { id: 'f1', lat: 10.7769, lng: 106.7009, address: "Fake Address 1", passenger: { name: "Khách Demo 1", phone: "090999", avatar: "" } },
                { id: 'f2', lat: 10.7550, lng: 106.6650, address: "Fake Address 2", passenger: { name: "Khách Demo 2", phone: "080888", avatar: "" } }
             ];
        }

        const stationLat = 10.742336; 
        const sortedRoute = routeData.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.lat - stationLat, 2));
            const distB = Math.sqrt(Math.pow(b.lat - stationLat, 2));
            return distA - distB;
        });

        return {
            timeSlot,
            // Lấy địa chỉ bến từ DB (để cập nhật theo Profile)
            station: { lat: 10.742336, lng: 106.613876, address: DRIVER_DB.info.stationStart },
            route: sortedRoute
        };
    }),

    // 6. Lấy lịch sử chuyến đi
    getHistoryByDate: async (date) => simulateNetwork(() => {
        return {
            "06:00 - 07:00": [
                { id: "h1", status: "completed", price: "15.000đ", address: "KTX Khu B", passenger: { name: "Nguyễn Văn A", avatar: "https://ui-avatars.com/api/?name=A" } },
                { id: "h2", status: "cancelled", price: "0đ", address: "Suối Tiên", passenger: { name: "Trần Thị B", avatar: "https://ui-avatars.com/api/?name=B" } }
            ],
            "09:00 - 10:00": [
                 { id: "h3", status: "completed", price: "25.000đ", address: "Q1 - Bitexco", passenger: { name: "Lê C", avatar: "https://ui-avatars.com/api/?name=C" } }
            ]
        };
    })
};