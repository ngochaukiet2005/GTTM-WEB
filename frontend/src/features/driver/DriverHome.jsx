// src/features/driver/DriverHome.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
// Import socket.io-client
import { io } from "socket.io-client";
import { apiClient, getStoredTokens, clearTokens } from '../../core/apiClient';

const DriverHome = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [slots, setSlots] = useState({});
  const [isOnline, setIsOnline] = useState(true);
  const [expandedSlots, setExpandedSlots] = useState([]); 
  const hasAutoExpanded = useRef(false);
  const socketRef = useRef(null); // Ref để giữ kết nối socket

  // Hàm fetchBookings được đưa lên trên để useEffect có thể gọi
  const fetchBookings = async () => {
    try {
        const res = await apiClient.getDriverTrips();
        // Backend trả về { status, data: { trips } }
        const trips = res?.data?.trips || [];
        
        if (trips.length > 0) {
            const groupedSlots = {};
            
            trips.forEach(trip => {
                // Tạo key giờ: Ví dụ "08:00"
                const date = new Date(trip.timeSlot);
                const timeKey = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const slotKey = `${timeKey}`; 

                // Map route items
                const bookings = trip.route.map(stop => ({
                    id: stop._id, 
                    tripId: trip._id, 
                    requestId: stop.requestId?._id,
                    passenger: {
                        name: stop.requestId?.passengerId?.name || "Khách hàng",
                        phone: stop.requestId?.passengerId?.phone,
                        avatar: `https://ui-avatars.com/api/?name=${stop.requestId?.passengerId?.name || 'User'}&background=random`
                    },
                    address: stop.location,
                    status: stop.status === 'pending' ? 'pending' : 'accepted',
                    type: stop.type
                }));

                if (!groupedSlots[slotKey]) groupedSlots[slotKey] = [];
                groupedSlots[slotKey].push(...bookings);
            });

            setSlots(groupedSlots);

            // Tự động mở slot đầu tiên
            if (!hasAutoExpanded.current && Object.keys(groupedSlots).length > 0) {
                const firstSlot = Object.keys(groupedSlots).sort()[0];
                setExpandedSlots([firstSlot]);
                hasAutoExpanded.current = true;
            }
        }
    } catch (error) {
        console.error("Lỗi tải lịch trình:", error);
        
        // Xử lý lỗi 401 (Token hết hạn)
        if (error.status === 401) {
            clearTokens(); 
            Swal.fire({
                icon: 'error',
                title: 'Phiên đăng nhập hết hạn',
                text: 'Vui lòng đăng nhập lại để tiếp tục.',
                confirmButtonText: 'Đăng nhập lại'
            }).then(() => {
                navigate('/driver/login');
            });
        }
    }
  };

  // --- KIỂM TRA ĐĂNG NHẬP & KẾT NỐI SOCKET ---
  useEffect(() => {
    // 1. Kiểm tra Token
    const tokens = getStoredTokens();
    if (!tokens || !tokens.accessToken) {
        navigate('/driver/login'); 
        return;
    }

    // 2. Lấy thông tin tài xế (Giả lập)
    const fetchProfile = async () => {
        try {
            setDriver({ name: tokens.user?.fullName || "Tài xế" }); 
        } catch (e) { console.error(e); }
    };
    fetchProfile();

    // 3. Setup Socket.io
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    // Cắt bỏ phần /api nếu có để lấy root url cho socket
    const socketUrl = backendUrl.endsWith('/api') ? backendUrl.replace('/api', '') : backendUrl;
    
    socketRef.current = io(socketUrl);

    socketRef.current.on("connect", () => {
        console.log("🔌 Socket connected:", socketRef.current.id);
        
        // Gửi sự kiện để tham gia room riêng của tài xế
        // Cần đảm bảo tokens.user có id hoặc _id
        const userId = tokens.user?.id || tokens.user?._id;
        if (userId) {
            socketRef.current.emit("join_driver_room", userId);
        }
    });

    // Lắng nghe sự kiện có chuyến mới từ Server
    socketRef.current.on("NEW_TRIP", (data) => {
        console.log("🔔 Nhận thông báo chuyến mới:", data);
        
        Swal.fire({
            title: 'Chuyến mới! 🚀',
            text: data.message || 'Bạn vừa được phân công một chuyến đi mới.',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });

        // Tải lại danh sách ngay lập tức
        fetchBookings();
    });

    // 4. Gọi dữ liệu lần đầu
    fetchBookings();

    // 5. Setup interval refresh (Dự phòng trường hợp socket miss)
    const interval = setInterval(fetchBookings, 15000); 

    // Cleanup
    return () => {
        if (socketRef.current) socketRef.current.disconnect();
        clearInterval(interval);
    };
  }, [navigate]);

  const handleStartTrip = (timeSlot, bookings) => {
      if (!bookings || bookings.length === 0) return;
      
      const tripId = bookings[0].tripId; 

      const currentTrip = localStorage.getItem('DRIVER_ACTIVE_TRIP');
      if (currentTrip) {
          const parsed = JSON.parse(currentTrip);
          if (parsed.tripId !== tripId) {
              Swal.fire("Chú ý", `Bạn đang thực hiện dở chuyến khác. Vui lòng hoàn thành nó trước!`, "warning");
              return;
          }
      }

      localStorage.setItem('DRIVER_ACTIVE_TRIP', JSON.stringify({
          tripId: tripId,
          timeSlot: timeSlot,
          stageIndex: 0 
      }));

      navigate('/driver/trip');
  };

  const toggleSlot = (slot) => {
      setExpandedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  if (!driver) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24 md:pb-8">
       <header className="bg-white shadow-sm sticky top-0 z-20 pb-6 pt-8 px-6 md:px-8">
           <div className="max-w-5xl mx-auto flex justify-between items-end">
               <div>
                   <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">chúc bạn lái xe an toàn</p>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Xin chào, {driver.name}! 👋</h1>
               </div>
               
               <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm active:scale-95 ${isOnline ? 'bg-green-50 text-green-700 border-2 border-green-500' : 'bg-slate-50 text-slate-500 border-2 border-slate-300'}`}
               >
                   <span className={`relative flex h-3 w-3`}>
                      {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-600' : 'bg-slate-400'}`}></span>
                   </span>
                   {isOnline ? 'Đang hoạt động' : 'Dừng hoạt động'}
               </button>
           </div>
       </header>

       <main className="max-w-5xl mx-auto px-4 py-8 md:px-8">
           <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">📅 Lịch trình</h2>
               <span className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full shadow-sm">Hôm nay</span>
           </div>

           <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              {Object.entries(slots).sort().map(([timeSlot, bookings]) => {
                  const acceptedCount = bookings.length; 
                  const isActive = acceptedCount > 0;
                  const isExpanded = expandedSlots.includes(timeSlot);

                  return (
                      <div key={timeSlot} className="relative flex items-start group z-10">
                          <div className={`absolute left-0 mt-6 ml-2 h-6 w-6 rounded-full border-[4px] border-white shadow-md z-10 transition-colors ${isActive ? 'bg-green-500 ring-4 ring-green-100' : 'bg-slate-300'}`}></div>

                          <div className={`ml-12 w-full bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isExpanded ? 'ring-2 ring-green-500/20 shadow-md' : ''}`}>
                              
                              <div onClick={() => toggleSlot(timeSlot)} className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white transition-colors">
                                  <div className="flex items-center gap-5">
                                      <div className={`px-4 py-3 rounded-2xl text-lg font-black tracking-tight text-center min-w-[100px] ${isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                          {timeSlot}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-slate-900 text-xl">Chuyến {timeSlot}</h3>
                                          <p className="text-sm text-slate-500 font-medium mt-1">{acceptedCount} hành khách</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6 flex-1 justify-end">
                                      <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center transition-all group-hover:bg-slate-100 ${isExpanded ? 'rotate-180 bg-green-50 text-green-600' : 'text-slate-400'}`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                          </svg>
                                      </div>
                                  </div>
                              </div>

                              {isExpanded && (
                                  <div className="border-t border-slate-100 bg-slate-50/30 animate-fade-in-down">
                                      <div className="p-4 md:p-6 space-y-3">
                                          {bookings.map((booking, idx) => (
                                              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:border-green-200 transition-colors">
                                                  <div className="flex items-center gap-4 flex-1 w-full">
                                                      <div className="relative">
                                                        <img src={booking.passenger.avatar} alt="" className="w-14 h-14 rounded-full bg-slate-200 object-cover border-2 border-white shadow-md" />
                                                      </div>
                                                      <div className="min-w-0">
                                                          <h4 className="font-extrabold text-slate-900 text-lg truncate">{booking.passenger.name}</h4>
                                                          <p className="text-sm text-slate-500 font-medium truncate">{booking.address}</p>
                                                      </div>
                                                  </div>
                                                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200 shadow-sm">
                                                      {booking.type === 'pickup' ? 'Đón khách' : 'Trả khách'}
                                                  </span>
                                              </div>
                                          ))}
                                      </div>

                                      <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10">
                                          <button 
                                              onClick={() => handleStartTrip(timeSlot, bookings)}
                                              className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] hover:-translate-y-0.5"
                                          >
                                              <span>🚀</span> BẮT ĐẦU CHUYẾN ĐI NÀY
                                          </button>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
              {Object.keys(slots).length === 0 && <div className="text-center py-20 text-slate-400">Chưa có lịch trình nào.</div>}
           </div>
       </main>
    </div>
  );
};

export default DriverHome;