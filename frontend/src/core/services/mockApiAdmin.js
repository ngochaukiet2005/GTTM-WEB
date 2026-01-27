// src/core/services/mockApiAdmin.js

const ADMIN_DB = {
    stats: {
        totalTrips: 1284,
        onlineDrivers: 42,
        totalDrivers: 50,
        avgRating: 4.8
    },
    drivers: [
        { id: 'd1', name: 'Nguyễn Văn A', phone: '0901234567', plate: '59X1-123.45', status: 'active', trips: 150, rating: 4.9 },
        { id: 'd2', name: 'Trần Thị B', phone: '0909888777', plate: '59X1-999.99', status: 'locked', trips: 80, rating: 4.5 },
        { id: 'd3', name: 'Lê Hoàng C', phone: '0912333444', plate: '59Z1-555.55', status: 'active', trips: 320, rating: 5.0 },
    ],
    // Cấu trúc Trips cập nhật (có date, startTime, endTime)
    trips: [
        // Chuyến xe ngày hiện tại/tương lai (Test trạng thái gốc)
        { 
            id: 'T01', 
            driver: 'Nguyễn Văn A', 
            plate: '59X1-123.45', 
            route: 'KTX Khu B ➝ Tòa nhà H1', 
            date: '2026-01-26', // Hãy chỉnh lại thành ngày hiện tại khi test
            startTime: '07:00', 
            endTime: '07:30', 
            status: 'Hoạt động' 
        },
        { 
            id: 'T02', 
            driver: 'Trần Thị B', 
            plate: '59X1-999.99', 
            route: 'Suối Tiên ➝ Thư viện Trung Tâm', 
            date: '2026-01-26', 
            startTime: '08:15', 
            endTime: '08:45', 
            status: 'Dừng hoạt động' 
        },
        // Chuyến xe ngày quá khứ (Test logic tự động chuyển sang "Hoàn thành")
        { 
            id: 'T03', 
            driver: 'Lê Hoàng C', 
            plate: '59Z1-555.55', 
            route: 'Nhà Điều Hành ➝ Hồ Đá', 
            date: '2025-01-25', 
            startTime: '09:00', 
            endTime: '09:30', 
            status: 'Hoạt động' 
        },
        { 
            id: 'T04', 
            driver: 'Nguyễn Văn A', 
            plate: '59X1-123.45', 
            route: 'KTX Khu A ➝ BK2', 
            date: '2025-01-24', 
            startTime: '10:00', 
            endTime: '10:45', 
            status: 'Hoạt động' 
        },
        { 
            id: 'T05', 
            driver: 'Phạm Văn D', 
            plate: '59X1-888.88', 
            route: 'Ngã 4 Thủ Đức ➝ Đại học Quốc Tế', 
            date: '2025-01-24', 
            startTime: '13:00', 
            endTime: '13:40', 
            status: 'Dừng hoạt động' 
        }
    ],
    reviews: [
        { 
            id: 'r1', 
            date: '2025-02-20', 
            items: [
                { id: 101, time: '10:30', rating: 5, comment: 'Tài xế thân thiện, xe sạch.', driver: 'Nguyễn Văn A', plate: '59X1-123.45', route: 'KTX Khu B ➝ Tòa H1' },
                { id: 102, time: '09:00', rating: 3, comment: 'Đợi xe hơi lâu.', driver: 'Trần Thị B', plate: '59X1-999.99', route: 'Suối Tiên ➝ Thư viện' }
            ]
        },
        { 
            id: 'r2', 
            date: '2025-02-19', 
            items: [
                { id: 201, time: '14:20', rating: 5, comment: 'Tuyệt vời!', driver: 'Lê Hoàng C', plate: '59Z1-555.55', route: 'Nhà xe ➝ Giảng đường 1' }
            ]
        }
    ]
};

// Dữ liệu Profile Admin mặc định
const ADMIN_PROFILE = {
    id: 'admin_01',
    name: 'Nguyễn Văn Quản Trị',
    email: 'admin@gttm.com',
    phone: '0909123456',
    role: 'Administrator',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiAdmin = {
    // Dashboard & Stats
    getDashboardStats: async () => { await delay(300); return ADMIN_DB.stats; },
    
    // Trips Management
    getRecentTrips: async () => { await delay(300); return ADMIN_DB.trips; },
    
    // Driver Management
    getAllDrivers: async () => { await delay(300); return ADMIN_DB.drivers; },
    createDriver: async (data) => { 
        await delay(500); 
        ADMIN_DB.drivers.push({ ...data, id: 'd' + Date.now(), status: 'active', trips: 0, rating: 5 }); 
        return true; 
    },
    toggleLockDriver: async (id) => { 
        await delay(300); 
        const dr = ADMIN_DB.drivers.find(d => d.id === id);
        if(dr) dr.status = dr.status === 'active' ? 'locked' : 'active';
        return true; 
    },
    deleteDriver: async (id) => { 
        await delay(300); 
        ADMIN_DB.drivers = ADMIN_DB.drivers.filter(d => d.id !== id); 
        return true; 
    },

    // Reviews
    getAllReviews: async () => { await delay(300); return ADMIN_DB.reviews; },

    // Profile Management (New)
    getProfile: async () => { 
        await delay(300); 
        return ADMIN_PROFILE; 
    },
    updateProfile: async (data) => {
        await delay(500);
        Object.assign(ADMIN_PROFILE, data); // Cập nhật dữ liệu vào object gốc
        return ADMIN_PROFILE;
    }
};