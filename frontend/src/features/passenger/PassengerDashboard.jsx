import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { mockService } from '../../core/services/mockApi';

const PassengerDashboard = () => {
  const navigate = useNavigate(); // Hook điều hướng
  // ... (giữ nguyên các state user, lastTrip, greeting)
  const [lastTrip, setLastTrip] = useState(null);
  const [user, setUser] = useState({ name: 'Khách', avatar: '' });
  const [greeting, setGreeting] = useState('Chào bạn');

  // ... (giữ nguyên useEffect)
  useEffect(() => {
    // ... code cũ
    const mockUser = { 
        name: 'Bạn', 
        avatar: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128' 
    };
    setUser(mockUser);
    mockService.getTripHistory('u1').then(data => {
        if(data && data.length > 0) setLastTrip(data[0]);
    });
    // ... code lời chào
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  // 👇 HÀM MỚI: Xử lý khi bấm vào chuyến đi cũ để đặt lại
  const handleRebook = (trip) => {
    if (!trip) return;
    // Chuyển hướng sang trang Booking kèm theo dữ liệu chuyến đi (state)
    navigate('/passenger/booking', { 
      state: { 
        pickup: trip.from, 
        destination: trip.to,
        rebookPrice: trip.price // Truyền giá tiền cũ sang (hoặc để tính lại)
      } 
    });
  };

  return (
    <div className="max-w-md mx-auto md:max-w-4xl pb-24 md:pb-0 font-sans">
       {/* ... (Giữ nguyên phần Header & Hero Card) ... */}
      <div className="flex items-center justify-between mb-8 pt-2">
         {/* ... code cũ header ... */}
         <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">{user.name} 👋</h1>
         </div>
         <Link to="/passenger/profile" className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden hover:scale-105 transition-transform">
             <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
         </Link>
      </div>

      <div className="mb-8">
        <Link 
          to="/passenger/booking" 
          className="block group relative w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] p-6 shadow-xl shadow-blue-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 active:scale-95"
        >
             {/* ... code cũ Hero Card ... */}
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

      <div className="grid grid-cols-2 gap-4 mb-8">
         {/* ... code cũ Grid Menu ... */}
        <Link to="/passenger/history" className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all active:scale-95 flex flex-col justify-between h-40 group">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-purple-100 transition-colors">📜</div>
            <div><h3 className="font-bold text-gray-800 text-lg">Lịch sử</h3><p className="text-xs text-gray-400 mt-1 font-medium">Xem lại chuyến đi</p></div>
        </Link>
        <Link to="/passenger/profile" className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 transition-all active:scale-95 flex flex-col justify-between h-40 group">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-orange-100 transition-colors">👤</div>
            <div><h3 className="font-bold text-gray-800 text-lg">Tài khoản</h3><p className="text-xs text-gray-400 mt-1 font-medium">Cài đặt & Ví</p></div>
        </Link>
      </div>

      {/* 4. WIDGET HOẠT ĐỘNG GẦN ĐÂY */}
      <div className="bg-gray-50/50 rounded-[24px] p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Gần đây nhất</h3>
            <Link to="/passenger/history" className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                Xem tất cả
            </Link>
        </div>

        {lastTrip ? (
            // 👇 SỬA: Thêm onClick gọi handleRebook
            <div 
                onClick={() => handleRebook(lastTrip)} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                title="Bấm để đặt lại chuyến này"
            >
                {/* ... (Phần hiển thị thông tin chuyến giữ nguyên) ... */}
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