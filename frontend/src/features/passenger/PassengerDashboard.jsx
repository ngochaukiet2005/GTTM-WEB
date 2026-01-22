// src/features/passenger/PassengerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockService } from '../../core/services/mockApi';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  
  // State quản lý dữ liệu
  const [user, setUser] = useState({ name: 'Khách', avatar: '' });
  const [greeting, setGreeting] = useState('Chào bạn');
  const [lastTrip, setLastTrip] = useState(null);
  
  // 👇 STATE MỚI: Chuyến đi đang hoạt động (Pending/Running)
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    // 1. Xử lý lời chào theo giờ
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Chào buổi sáng');
    else if (hour >= 12 && hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    // 2. Lấy thông tin User & Lịch sử cũ
    const fetchData = async () => {
        // Giả lập login để lấy tên thật
        try {
            const loginData = await mockService.login('khach', '123', 'passenger');
            setUser(loginData.user);
        } catch (e) {
            // Fallback nếu lỗi
            setUser({ 
                name: 'Bạn mình', 
                avatar: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128' 
            });
        }

        // Lấy chuyến đi gần nhất (cho widget cuối trang)
        mockService.getTripHistory('u1').then(data => {
            // Lọc ra chuyến đã hoàn thành hoặc hủy để hiện ở mục "Gần đây"
            const history = data.filter(t => ['completed', 'cancelled'].includes(t.status));
            if(history && history.length > 0) setLastTrip(history[0]);
        });
    };
    fetchData();

    // 3. Polling: Lấy chuyến đi ĐANG HOẠT ĐỘNG (Pending/Running)
    const fetchActiveTrip = async () => {
        const trip = await mockService.getCurrentTrip('u1');
        setActiveTrip(trip);
    };
    fetchActiveTrip();
    const interval = setInterval(fetchActiveTrip, 3000); // Cập nhật mỗi 3s
    
    return () => clearInterval(interval);
  }, []);

  // Hàm đặt lại chuyến cũ
  const handleRebook = (trip) => {
    if (!trip) return;
    navigate('/passenger/booking', { 
      state: { 
        pickup: trip.from, 
        destination: trip.to,
        rebookPrice: trip.price 
      } 
    });
  };

  // 👇 HÀM MỚI: Chuyển hướng khi bấm vào đơn đang chạy
  const goToActiveTrip = () => {
    navigate('/passenger/history');
  };

  return (
    <div className="max-w-md mx-auto md:max-w-4xl pb-24 md:pb-0 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8 pt-2">
         <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{greeting},</p>
            {/* Hiển thị tên thật từ User */}
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">{user.name} 👋</h1>
         </div>
         <Link to="/passenger/profile" className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden hover:scale-105 transition-transform">
             <img src={user.avatar || "https://ui-avatars.com/api/?background=random"} alt="Avatar" className="w-full h-full object-cover" />
         </Link>
      </div>

      <div className="mb-6">
        {/* --- HERO CARD (ĐẶT XE) --- */}
        <Link 
          to="/passenger/booking" 
          className="block group relative w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] p-6 shadow-xl shadow-blue-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 active:scale-95"
        >
             <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
            
             <div className="relative z-10 flex items-center justify-between">
                <div>
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-white/10">
                        GTTM Auto Shuttle
                    </span>
                    <h2 className="text-3xl font-bold text-white mb-2 leading-tight">Đặt xe<br/>ngay bây giờ</h2>
                    <p className="text-blue-100 text-sm max-w-[180px] font-medium opacity-90">
                        Tìm tài xế gần nhất và di chuyển an toàn.
                    </p>
                </div>
                <div className="text-[80px] drop-shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-out">
                    🚖
                </div>
            </div>
            
            <div className="mt-6 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm group-hover:bg-blue-50 transition-colors">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-gray-400 text-sm font-medium group-hover:text-blue-600">Bạn muốn đi đâu?</span>
            </div>
        </Link>
      </div>

      {/* 👇 TÍNH NĂNG MỚI: THẺ ĐƠN HÀNG ĐANG CHẠY (CHỈ HIỆN KHI CÓ) */}
      {activeTrip && (
        <div className="mb-8 animate-fade-in-down">
            <div className="flex justify-between items-end mb-2 px-1">
                <h3 className="font-bold text-lg text-gray-800">Bạn Đang Có Chuyến</h3>
                <span className="text-xs font-bold text-blue-600 animate-pulse">● Trực tiếp</span>
            </div>
            
            <div 
                onClick={goToActiveTrip}
                className="bg-white p-5 rounded-[24px] border border-blue-100 shadow-lg shadow-blue-50 cursor-pointer active:scale-95 transition-all relative overflow-hidden group hover:border-blue-300"
            >
                {/* Thanh trạng thái dọc */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:w-2 transition-all"></div>

                <div className="flex justify-between items-start mb-3 pl-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-600`}>
                        {activeTrip.status === 'pending' ? 'Đang tìm tài xế...' : 'Tài xế đang đến'}
                    </span>
                    <span className="font-bold text-blue-600 text-lg">{activeTrip.price}</span>
                </div>

                <div className="flex items-center gap-4 pl-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl border border-blue-100 shrink-0">
                       {activeTrip.driver ? '🚕' : '📡'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 truncate text-base">
                            {activeTrip.to.address}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {activeTrip.driver ? `Tài xế: ${activeTrip.driver.name}` : 'Đang kết nối hệ thống...'}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* GRID MENU (Lịch sử & Profile) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link to="/passenger/history" className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all active:scale-95 flex flex-col justify-between h-40 group">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-purple-100 transition-colors">📜</div>
            <div><h3 className="font-bold text-gray-800 text-lg">Lịch sử</h3><p className="text-xs text-gray-400 mt-1 font-medium">Xem lại chuyến đi</p></div>
        </Link>
        <Link to="/passenger/profile" className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 transition-all active:scale-95 flex flex-col justify-between h-40 group">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-orange-100 transition-colors">👤</div>
            <div><h3 className="font-bold text-gray-800 text-lg">Tài khoản</h3><p className="text-xs text-gray-400 mt-1 font-medium">Cài đặt & Ví</p></div>
        </Link>
      </div>

      {/* WIDGET HOẠT ĐỘNG GẦN ĐÂY NHẤT (Đã hoàn thành/Hủy) */}
      <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Gần đây nhất</h3>
            <Link to="/passenger/history" className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                Xem tất cả
            </Link>
        </div>

        {lastTrip ? (
            <div 
                onClick={() => handleRebook(lastTrip)} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                title="Bấm để đặt lại chuyến này"
            >
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${
                    lastTrip.status === 'completed' ? 'bg-green-100 text-green-600' : 
                    lastTrip.status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'
                }`}>
                    {lastTrip.status === 'completed' ? '✔' : lastTrip.status === 'cancelled' ? '✕' : '➜'}
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate text-sm mb-0.5">{lastTrip.to.address}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        {new Date(lastTrip.date).toLocaleDateString('vi-VN')}
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        {lastTrip.distance}
                    </p>
                </div>

                <span className="font-extrabold text-gray-800 text-sm bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                    {lastTrip.price}
                </span>
            </div>
        ) : (
             <div className="text-center py-8">
                <p className="text-4xl mb-2 grayscale opacity-50">🍃</p>
                <p className="text-gray-400 text-sm font-medium">Chưa có chuyến đi nào.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDashboard;