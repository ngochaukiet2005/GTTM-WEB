// src/features/passenger/TripHistory.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '../../core/services/mockApi';

const TripHistory = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  
  // State cho Modal Đánh giá
  const [ratingModal, setRatingModal] = useState({ show: false, trip: null });
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    mockService.getTripHistory('u1').then(setTrips);
  }, []);

  // Phân loại chuyến đi
  const activeTrips = trips.filter(t => ['pending', 'accepted', 'running'].includes(t.status));
  const pastTrips = trips.filter(t => ['completed', 'cancelled'].includes(t.status));

  // Xử lý Đặt lại
  const handleRebook = (trip) => {
    navigate('/passenger/booking', { state: { pickup: trip.from, destination: trip.to, rebookPrice: trip.price } });
  };

  // Xử lý gửi đánh giá
  const handleSubmitReview = async () => {
    if (!ratingModal.trip) return;
    await mockService.submitReview(ratingModal.trip.id, star, comment);
    
    alert("Cảm ơn bạn đã đánh giá!");
    setRatingModal({ show: false, trip: null });
    // Reload lại list để cập nhật
    mockService.getTripHistory('u1').then(setTrips);
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-24 font-sans text-slate-800">
      <h1 className="text-2xl font-bold mb-6 px-4 md:px-0">Quản lý chuyến đi</h1>

      {/* 1. TABS SWITCHER */}
      <div className="flex p-1 bg-gray-100 rounded-xl mx-4 md:mx-0 mb-6 relative">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all z-10 ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Đang hoạt động ({activeTrips.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all z-10 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Lịch sử ({pastTrips.length})
        </button>
      </div>

      {/* 2. LIST CONTENT */}
      <div className="space-y-4 px-4 md:px-0">
        {(activeTab === 'active' ? activeTrips : pastTrips).map(trip => (
          <div key={trip.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    trip.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    trip.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    trip.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {trip.status === 'pending' ? '⏳ Đang tìm xe' : 
                     trip.status === 'running' ? '🚕 Đang chạy' : 
                     trip.status === 'completed' ? '✔ Hoàn thành' : '✕ Đã hủy'}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">{new Date(trip.date).toLocaleString('vi-VN')}</p>
               </div>
               <p className="text-lg font-bold text-blue-600">{trip.price}</p>
            </div>

            {/* Route Info */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{trip.from.address}</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{trip.to.address}</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              
              {/* Nếu đang chạy: Hiện thông tin tài xế */}
              {activeTab === 'active' && (
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">👮‍♂️</div>
                    <div className="text-xs">
                        <p className="font-bold text-gray-700">{trip.driver ? trip.driver.name : "Đang điều phối..."}</p>
                        <p className="text-gray-400">{trip.driver ? trip.driver.plate : ""}</p>
                    </div>
                 </div>
              )}

              {/* Nếu là Lịch sử: Nút Đặt lại & Đánh giá */}
              {activeTab === 'history' && (
                <div className="flex gap-2 w-full justify-end">
                  {/* Nút Đánh giá (Chỉ hiện khi hoàn thành) */}
                  {trip.status === 'completed' && (
                    <button 
                        onClick={() => { setRatingModal({ show: true, trip }); setStar(5); setComment(''); }}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                    >
                        {trip.rating > 0 ? `⭐ ${trip.rating}/5` : '⭐ Đánh giá'}
                    </button>
                  )}
                  
                  {/* Nút Đặt lại (Góc dưới) */}
                  <button 
                    onClick={() => handleRebook(trip)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Đặt lại
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(activeTab === 'active' ? activeTrips : pastTrips).length === 0 && (
            <div className="text-center py-12 text-gray-400">
                <p>Không có chuyến nào.</p>
            </div>
        )}
      </div>

      {/* 3. MODAL ĐÁNH GIÁ (Popup) */}
      {ratingModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 px-4">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
              <h3 className="text-lg font-bold text-center mb-4">Đánh giá chuyến đi</h3>
              
              {/* Chọn Sao */}
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setStar(s)} className="text-3xl transition-transform hover:scale-110 focus:outline-none">
                        {s <= star ? '⭐' : '☆'}
                    </button>
                ))}
              </div>

              {/* Ghi chú */}
              <textarea 
                 className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                 rows="3"
                 placeholder="Bạn cảm thấy thế nào? (Tài xế, xe cộ...)"
                 value={comment}
                 onChange={(e) => setComment(e.target.value)}
              ></textarea>

              <div className="flex gap-3 mt-6">
                 <button onClick={() => setRatingModal({show: false, trip: null})} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Bỏ qua</button>
                 <button onClick={handleSubmitReview} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">Gửi ngay</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default TripHistory;