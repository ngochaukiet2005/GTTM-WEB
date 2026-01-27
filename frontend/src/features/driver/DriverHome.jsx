// src/features/driver/DriverHome.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { mockDriverService } from '../../core/services/mockApiDriver';

const DriverHome = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [slots, setSlots] = useState({});
  const [isOnline, setIsOnline] = useState(true);
  const [expandedSlots, setExpandedSlots] = useState([]); 
  const hasAutoExpanded = useRef(false);

  useEffect(() => {
    mockDriverService.getDriverProfile().then(setDriver);
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    const data = await mockDriverService.getBookingsBySlots();
    setSlots(data);
    if (!hasAutoExpanded.current && Object.keys(data).length > 0) {
        const firstSlot = Object.keys(data).sort()[0];
        setExpandedSlots([firstSlot]);
        hasAutoExpanded.current = true;
    }
  };

  const handleReview = async (bookingId, action) => {
    try {
        await mockDriverService.reviewBooking(bookingId, action);
        fetchBookings();
        if(action === 'accepted') Swal.fire({toast: true, position: 'bottom-end', icon: 'success', title: 'Đã nhận khách', showConfirmButton: false, timer: 1000});
    } catch (error) {
        Swal.fire("Lỗi", error.message, "error");
    }
  };

  // 👇 CẬP NHẬT HÀM NÀY: Lưu trạng thái chuyến đi để giữ lại khi chuyển tab
  const handleStartTrip = (timeSlot) => {
      // Kiểm tra xem có chuyến nào đang chạy dở không?
      const currentTrip = localStorage.getItem('DRIVER_ACTIVE_TRIP');
      if (currentTrip) {
          const parsed = JSON.parse(currentTrip);
          if (parsed.timeSlot !== timeSlot) {
              Swal.fire("Chú ý", `Bạn đang thực hiện dở chuyến ${parsed.timeSlot}. Vui lòng hoàn thành nó trước!`, "warning");
              return;
          }
      }

      // Lưu trạng thái chuyến mới (Bắt đầu từ chặng 0)
      localStorage.setItem('DRIVER_ACTIVE_TRIP', JSON.stringify({
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
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Xin chào, {driver.name.split(' ').pop()}! 👋</h1>
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
               <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  📅 Lịch trình
               </h2>
               <span className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full shadow-sm">Hôm nay, 24/03</span>
           </div>

           <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              {Object.entries(slots).sort().map(([timeSlot, bookings]) => {
                  const acceptedCount = bookings.filter(b => b.status === 'accepted').length;
                  const pendingCount = bookings.filter(b => b.status === 'pending').length;
                  const capacity = 16;
                  const percent = (acceptedCount / capacity) * 100;
                  const isFull = acceptedCount >= capacity;
                  const isExpanded = expandedSlots.includes(timeSlot);
                  const isActive = acceptedCount > 0;

                  return (
                      <div key={timeSlot} className="relative flex items-start group z-10">
                          <div className={`absolute left-0 mt-6 ml-2 h-6 w-6 rounded-full border-[4px] border-white shadow-md z-10 transition-colors ${isActive ? 'bg-green-500 ring-4 ring-green-100' : 'bg-slate-300'}`}></div>

                          <div className={`ml-12 w-full bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isExpanded ? 'ring-2 ring-green-500/20 shadow-md' : ''}`}>
                              
                              <div 
                                onClick={() => toggleSlot(timeSlot)}
                                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white transition-colors"
                              >
                                  <div className="flex items-center gap-5">
                                      <div className={`px-4 py-3 rounded-2xl text-lg font-black tracking-tight text-center min-w-[100px] ${isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                          {timeSlot.split('-')[0]}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-slate-900 text-xl">Khung giờ {timeSlot}</h3>
                                          {pendingCount > 0 ? (
                                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 animate-pulse">
                                                ⚠️ Cần duyệt: {pendingCount} khách
                                              </span>
                                          ) : (
                                              <p className="text-sm text-slate-500 font-medium mt-1">Sẵn sàng khởi hành</p>
                                          )}
                                      </div>
                                  </div>

                                  <div className="flex items-center gap-6 flex-1 justify-end">
                                      <div className="flex-1 max-w-[220px]">
                                          <div className="flex justify-between text-sm font-bold mb-2">
                                              <span className={isFull ? 'text-red-600' : 'text-slate-600'}>
                                                  {isFull ? 'Đã kín chỗ' : 'Sức chứa'}
                                              </span>
                                              <span className="text-slate-900">{acceptedCount}/<span className="text-slate-400">{capacity}</span></span>
                                          </div>
                                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                                              <div 
                                                className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${isFull ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`} 
                                                style={{ width: `${percent}%` }}
                                              ></div>
                                          </div>
                                      </div>
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
                                          {bookings.length === 0 ? (
                                              <div className="text-center py-12 text-slate-400">
                                                  <p className="text-4xl mb-2">📭</p>
                                                  <p className="font-medium">Chưa có booking nào.</p>
                                              </div>
                                          ) : (
                                              bookings.map(booking => (
                                                  <div key={booking.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:border-green-200 transition-colors">
                                                      <div className="flex items-center gap-4 flex-1 w-full">
                                                          <div className="relative">
                                                            <img src={booking.passenger.avatar} alt="" className="w-14 h-14 rounded-full bg-slate-200 object-cover border-2 border-white shadow-md" />
                                                            {booking.status === 'accepted' && <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>}
                                                          </div>
                                                          <div className="min-w-0">
                                                              <h4 className="font-extrabold text-slate-900 text-lg truncate">{booking.passenger.name}</h4>
                                                              <p className="text-sm text-slate-500 font-medium truncate">{booking.address}</p>
                                                          </div>
                                                      </div>
                                                      
                                                      <div className="flex items-center justify-end w-full md:w-auto gap-3">
                                                          {booking.status === 'accepted' && (
                                                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200 shadow-sm">
                                                                  ✅ Đã xếp chỗ
                                                              </span>
                                                          )}
                                                          {booking.status === 'rejected' && (
                                                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-200 opacity-70">
                                                                  🚫 Đã từ chối
                                                              </span>
                                                          )}
                                                          {booking.status === 'pending' && (
                                                              <>
                                                                  <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleReview(booking.id, 'rejected'); }}
                                                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-white border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition-all"
                                                                  >
                                                                      Từ chối
                                                                  </button>
                                                                  <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleReview(booking.id, 'accepted'); }}
                                                                    disabled={isFull}
                                                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm active:scale-95 ${isFull ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200 hover:shadow-md'}`}
                                                                  >
                                                                      {isFull ? 'Đã đầy' : 'Chấp nhận'}
                                                                  </button>
                                                              </>
                                                          )}
                                                      </div>
                                                  </div>
                                              ))
                                          )}
                                      </div>

                                      {acceptedCount > 0 && (
                                          <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10">
                                              <button 
                                                onClick={() => handleStartTrip(timeSlot)}
                                                className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] hover:-translate-y-0.5"
                                              >
                                                  <span>🚀</span>
                                                  BẮT ĐẦU CHUYẾN ĐI NÀY
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
              
              {Object.keys(slots).length === 0 && <div className="text-center py-20 text-slate-400">Đang tải lịch trình...</div>}
           </div>
       </main>
    </div>
  );
};

export default DriverHome;