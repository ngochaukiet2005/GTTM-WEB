// src/features/driver/DriverHistory.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../core/apiClient';

const DriverHistory = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState({});
  const [expandedSlots, setExpandedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Sử dụng API lấy lịch sử
      const data = await apiClient.getDriverTrips();
      const trips = data?.trips || [];
      
      // Filter by selected date and group by time slot
      const filtered = trips.filter(trip => 
        trip.startTime?.split('T')[0] === selectedDate
      );
      
      const grouped = {};
      filtered.forEach(trip => {
        const timeSlot = trip.startTime?.split('T')[1]?.slice(0, 5) || '00:00';
        if (!grouped[timeSlot]) {
          grouped[timeSlot] = [];
        }
        grouped[timeSlot].push({
          id: trip._id,
          status: trip.status === 'completed' ? 'completed' : 'pending',
          route: trip.route || 'N/A',
          passengers: trip.passengerCount || 0,
          time: timeSlot
        });
      });
      
      setSlots(grouped);
      setExpandedSlots(Object.keys(grouped));
    } catch (err) {
      console.error("Error fetching history:", err);
      setSlots({});
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (slot) => {
    setExpandedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-8">
       {/* --- HEADER --- */}
       <header className="bg-white shadow-sm sticky top-0 z-20 px-6 py-6 md:px-8">
           <div className="max-w-4xl mx-auto"> {/* Giới hạn chiều rộng để nội dung tập trung hơn */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                       <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Lịch sử hoạt động</h1>
                       <p className="text-slate-500 font-medium">Danh sách các chuyến xe đã chạy</p>
                   </div>
                   
                   {/* DATE PICKER */}
                   <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner">
                       <button 
                         onClick={() => {
                             const d = new Date(selectedDate);
                             d.setDate(d.getDate() - 1);
                             setSelectedDate(d.toISOString().split('T')[0]);
                         }}
                         className="p-3 bg-white rounded-xl text-slate-600 hover:text-slate-900 shadow-sm hover:shadow-md transition-all active:scale-95"
                       >
                           ◀
                       </button>
                       <input 
                          type="date" 
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="bg-transparent border-none text-lg font-bold text-slate-700 outline-none text-center cursor-pointer w-36"
                       />
                       <button 
                         onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}
                         className="p-3 bg-white rounded-xl text-slate-600 hover:text-slate-900 shadow-sm hover:shadow-md transition-all active:scale-95"
                       >
                           ▶
                       </button>
                   </div>
               </div>
           </div>
       </header>

       {/* --- CONTENT --- */}
       <main className="max-w-4xl mx-auto px-4 py-8 md:px-8">
           {loading ? (
               <div className="flex justify-center py-20">
                   <div className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
               </div>
           ) : Object.keys(slots).length === 0 ? (
               <div className="text-center py-24 opacity-50 flex flex-col items-center">
                   <div className="text-7xl mb-6 grayscale">📅</div>
                   <p className="font-bold text-slate-500 text-xl">Không có chuyến nào ngày này</p>
               </div>
           ) : (
               <div className="space-y-10 relative before:absolute before:inset-0 before:ml-6 md:before:ml-8 before:-translate-x-px before:h-full before:w-1 before:bg-slate-200">
                  {Object.entries(slots).sort().map(([timeSlot, bookings]) => {
                      const completedCount = bookings.filter(b => b.status === 'completed').length;
                      const isExpanded = expandedSlots.includes(timeSlot);

                      return (
                          <div key={timeSlot} className="relative pl-16 md:pl-20">
                              {/* Timeline Dot */}
                              <div className="absolute left-3 md:left-5 top-8 w-7 h-7 bg-slate-400 rounded-full border-[5px] border-slate-50 shadow-md z-10 box-content"></div>

                              <div className={`bg-white rounded-[24px] border border-slate-100 shadow-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-4 ring-blue-50/50' : 'hover:shadow-xl'}`}>
                                  {/* Card Header (Slot Time) */}
                                  <div 
                                    onClick={() => toggleSlot(timeSlot)}
                                    className="p-8 cursor-pointer flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                                  >
                                      <div>
                                          <div className="inline-block bg-blue-100 text-blue-700 text-sm font-extrabold px-3 py-1.5 rounded-lg mb-3 tracking-wide">
                                              KHUNG GIỜ {timeSlot}
                                          </div>
                                          <h3 className="font-bold text-slate-800 text-2xl">
                                              {bookings.length} Khách <span className="font-normal text-slate-300 mx-2">|</span> <span className="text-green-600">{completedCount} Hoàn thành</span>
                                          </h3>
                                      </div>
                                      <div className={`w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                      </div>
                                  </div>

                                  {/* Card Body (List Passengers) */}
                                  {isExpanded && (
                                      <div className="border-t border-slate-100 bg-slate-50/30 p-6 space-y-4">
                                          {bookings.map(booking => (
                                              <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                  <div className="flex items-center gap-5">
                                                      <div className="relative">
                                                          <img src={booking.passenger.avatar} alt="" className="w-16 h-16 rounded-full bg-slate-200 object-cover border-4 border-white shadow-sm" />
                                                          <div className={`absolute bottom-0 right-0 w-5 h-5 border-2 border-white rounded-full ${booking.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                      </div>
                                                      <div>
                                                          <h4 className="font-bold text-slate-800 text-lg mb-1">{booking.passenger.name}</h4>
                                                          <div className="flex items-center text-slate-500 text-sm font-medium">
                                                              <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                              {booking.address}
                                                          </div>
                                                      </div>
                                                  </div>
                                                  
                                                  {/* Status Badge Only - No Price */}
                                                  <div>
                                                      <span className={`text-xs uppercase font-extrabold px-3 py-1.5 rounded-lg tracking-wider ${booking.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                          {booking.status === 'completed' ? 'Thành công' : 'Thất bại'}
                                                      </span>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          </div>
                      );
                  })}
               </div>
           )}
       </main>
    </div>
  );
};

export default DriverHistory;