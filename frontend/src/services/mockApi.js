// src/services/mockStore.js

// 1. DATABASE GIẢ (Lưu trữ trong bộ nhớ tạm)
const MOCK_DB = {
  users: [
    {
      id: "u1",
      username: "khach",
      password: "123",
      fullName: "Nguyễn Văn Khách",
      role: "passenger",
      phone: "0905123456"
    },
    {
      id: "u2",
      username: "taixe",
      password: "123",
      fullName: "Trần Tài Xế",
      role: "driver",
      plateNumber: "59X1-123.45"
    },
    {
      id: "u3",
      username: "admin",
      password: "123",
      fullName: "Admin Hệ Thống",
      role: "admin"
    }
  ],
  trips: [] // Danh sách chuyến xe
};

// 2. HÀM GIẢ LẬP MẠNG (Tạo độ trễ 1 giây)
const simulateNetwork = (callback) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = callback();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 1000); // Giả vờ mạng chậm 1s
  });
};

// 3. CÁC SERVICE (API GIẢ)
export const mockService = {
  // --- AUTH ---
  login: async (username, password, role) => {
    return simulateNetwork(() => {
      const user = MOCK_DB.users.find(u => u.username === username && u.password === password);
      
      if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu!");
      if (user.role !== role) throw new Error(`Tài khoản này không phải là ${role}!`);
      
      return { 
        token: "fake-jwt-token-123", 
        user: { id: user.id, name: user.fullName, role: user.role } 
      };
    });
  },

  register: async (userData) => {
    return simulateNetwork(() => {
      if (MOCK_DB.users.find(u => u.username === userData.username)) {
        throw new Error("Tên đăng nhập đã tồn tại!");
      }
      const newUser = { 
        id: `u${Date.now()}`, 
        ...userData, 
        role: 'passenger' // Mặc định đăng ký là khách
      };
      MOCK_DB.users.push(newUser);
      return newUser;
    });
  },

  // --- TRIP (CHUYẾN XE) ---
  createTrip: async (tripData) => {
    return simulateNetwork(() => {
      const newTrip = {
        id: `trip_${Date.now()}`,
        status: 'pending', // pending -> accepted -> running -> completed
        createdAt: new Date().toISOString(),
        ...tripData
      };
      MOCK_DB.trips.push(newTrip);
      console.log("📍 [MOCK DB] Chuyến mới đã tạo:", newTrip);
      return newTrip;
    });
  }
};