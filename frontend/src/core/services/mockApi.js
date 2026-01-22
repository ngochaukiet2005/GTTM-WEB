// src/core/services/mockApi.js

// ----------------------------------------------------------------------
// 1. DATABASE GIẢ (Lưu trữ trong bộ nhớ tạm - RAM)
// ----------------------------------------------------------------------

const MOCK_DB = {
  users: [
    {
      id: "u1",
      username: "khach",
      password: "123",
      fullName: "Nguyễn Văn Khách",
      role: "passenger",
      phone: "0905123456",
      avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+Khach&background=random"
    },
    {
      id: "u2",
      username: "taixe",
      password: "123",
      fullName: "Trần Tài Xế",
      role: "driver",
      plateNumber: "59X1-123.45",
      phone: "0909888777",
      avatar: "https://ui-avatars.com/api/?name=Tran+Tai+Xe&background=random"
    },
    {
      id: "u3",
      username: "admin",
      password: "123",
      fullName: "Admin Hệ Thống",
      role: "admin"
    }
  ],

  // Dữ liệu mẫu cho lịch sử chuyến đi
  trips: [
    {
      id: "trip_01",
      date: "2024-03-20T08:30:00Z",
      passengerId: "u1",
      driver: { name: "Trần Tài Xế", plate: "59X1-123.45", phone: "0909888777" },
      from: { 
        lat: 10.742336, 
        lng: 106.613876, 
        address: "Bến xe Miền Tây, 395 Kinh Dương Vương" 
      },
      to: { 
        lat: 10.744500, 
        lng: 106.618000, 
        address: "Aeon Mall Bình Tân, Số 1 Đường số 17A" 
      },
      distance: "1.2 km",
      price: "25.000đ",
      status: "completed",
      rating: 5,
      comment: "Tài xế thân thiện, xe sạch."
    },
    {
      id: "trip_02",
      date: "2024-03-19T14:15:00Z",
      passengerId: "u1",
      driver: { name: "Lê Văn B", plate: "59X2-999.99", phone: "0912345678" },
      from: { 
        lat: 10.755000, 
        lng: 106.665000, 
        address: "Đại học Y Dược TP.HCM" 
      },
      to: { 
        lat: 10.742336, 
        lng: 106.613876, 
        address: "Bến xe Miền Tây" 
      },
      distance: "5.4 km",
      price: "45.000đ",
      status: "cancelled",
      rating: 0,
      comment: ""
    }
  ]
};

// ----------------------------------------------------------------------
// 2. HÀM GIẢ LẬP MẠNG
// ----------------------------------------------------------------------
const simulateNetwork = (callback) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = callback();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 800); 
  });
};

// ----------------------------------------------------------------------
// 3. CÁC SERVICE (API GIẢ)
// ----------------------------------------------------------------------
export const mockService = {
  
  // --- AUTHENTICATION ---
  login: async (username, password, role) => {
    return simulateNetwork(() => {
      const user = MOCK_DB.users.find(u => u.username === username && u.password === password);
      
      if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu!");
      if (user.role !== role) throw new Error(`Tài khoản này không phải là ${role}!`);
      
      return { 
        token: "fake-jwt-token-123", 
        user: { 
          id: user.id, 
          name: user.fullName, 
          role: user.role, 
          avatar: user.avatar 
        } 
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
        role: 'passenger', 
        avatar: `https://ui-avatars.com/api/?name=${userData.fullName}&background=random`
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
        status: 'pending', 
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
        driver: null, 
        rating: 0,
        comment: "",
        ...tripData
      };
      MOCK_DB.trips.unshift(newTrip);
      console.log("📍 [MOCK DB] Chuyến mới đã tạo:", newTrip);
      return newTrip;
    });
  },

  getTripHistory: async (userId) => {
    return simulateNetwork(() => {
      const history = MOCK_DB.trips
        .filter(t => t.passengerId === userId || !userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return history;
    });
  },

  getCurrentTrip: async (userId) => {
    return simulateNetwork(() => {
      const activeTrip = MOCK_DB.trips.find(t => 
        (t.passengerId === userId || !userId) && 
        ['pending', 'accepted', 'arriving', 'running'].includes(t.status)
      );
      return activeTrip || null;
    });
  },

  getPendingTrips: async () => {
    return simulateNetwork(() => {
      return MOCK_DB.trips.filter(t => t.status === 'pending');
    });
  },

  acceptTrip: async (tripId, driverInfo) => {
    return simulateNetwork(() => {
      const trip = MOCK_DB.trips.find(t => t.id === tripId);
      if (!trip) throw new Error("Chuyến không tồn tại");
      trip.driver = driverInfo;
      trip.status = 'accepted'; 
      mockService.startSimulation(tripId);
      return trip;
    });
  },

  cancelTrip: async (tripId) => {
    return simulateNetwork(() => {
        const trip = MOCK_DB.trips.find(t => t.id === tripId);
        if (!trip) throw new Error("Chuyến không tồn tại");
        
        if (['completed', 'cancelled'].includes(trip.status)) {
            throw new Error("Không thể hủy chuyến này");
        }

        trip.status = 'cancelled';
        console.log(`❌ Chuyến ${tripId} đã bị hủy bởi khách hàng.`);
        return { success: true };
    });
  },

  startSimulation: (tripId) => {
    const trip = MOCK_DB.trips.find(t => t.id === tripId);
    if (!trip) return;

    setTimeout(() => { if (trip.status === 'accepted') trip.status = 'arriving'; }, 5000);
    setTimeout(() => { if (trip.status === 'arriving') trip.status = 'running'; }, 10000);
    setTimeout(() => { if (trip.status === 'running') trip.status = 'completed'; }, 20000);
  },

  submitReview: async (tripId, rating, comment) => {
    return simulateNetwork(() => {
      const trip = MOCK_DB.trips.find(t => t.id === tripId);
      if (trip) {
        trip.rating = rating;
        trip.comment = comment;
        return { success: true };
      }
      return { success: false };
    });
  },

  getAllReviews: async () => {
    return simulateNetwork(() => {
      const reviews = MOCK_DB.trips
        .filter(t => t.status === 'completed' && t.rating > 0)
        .map(t => ({
          id: t.id,
          driverName: t.driver ? t.driver.name : "Unknown Driver",
          rating: t.rating,
          comment: t.comment,
          date: new Date(t.date).toLocaleDateString('vi-VN')
        }));
      return reviews;
    });
  }
};