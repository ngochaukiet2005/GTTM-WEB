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
    trips: [
        { id: 't1', driver: 'Nguyễn Văn A', plate: '59X1-123.45', passenger: 'SV Nguyễn X', start: 'KTX Khu B', end: 'Tòa nhà H1', status: 'running', time: '10:30 - Hôm nay' },
        { id: 't2', driver: 'Lê Hoàng C', plate: '59Z1-555.55', passenger: 'GV Trần Y', start: 'Nhà Điều Hành', end: 'Hồ Đá', status: 'completed', time: '09:15 - Hôm nay' },
        { id: 't3', driver: 'Nguyễn Văn A', plate: '59X1-123.45', passenger: 'SV Lê Z', start: 'Suối Tiên', end: 'KTX Khu A', status: 'cancelled', time: '08:00 - Hôm nay' },
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiAdmin = {
    getDashboardStats: async () => { await delay(300); return ADMIN_DB.stats; },
    getRecentTrips: async () => { await delay(300); return ADMIN_DB.trips; },
    getAllDrivers: async () => { await delay(300); return ADMIN_DB.drivers; },
    getAllReviews: async () => { await delay(300); return ADMIN_DB.reviews; },
    
    // Giả lập hành động quản lý tài xế
    createDriver: async (data) => { await delay(500); ADMIN_DB.drivers.push({ ...data, id: 'd' + Date.now(), status: 'active', trips: 0, rating: 5 }); return true; },
    toggleLockDriver: async (id) => { 
        await delay(300); 
        const dr = ADMIN_DB.drivers.find(d => d.id === id);
        if(dr) dr.status = dr.status === 'active' ? 'locked' : 'active';
        return true; 
    },
    deleteDriver: async (id) => { await delay(300); ADMIN_DB.drivers = ADMIN_DB.drivers.filter(d => d.id !== id); return true; }
};