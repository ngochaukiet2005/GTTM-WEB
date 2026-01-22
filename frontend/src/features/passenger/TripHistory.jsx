// src/features/passenger/TripHistory.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockService } from '../../core/services/mockApi';

const TripHistory = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  
  // State: Đánh giá (Input)
  const [ratingModal, setRatingModal] = useState({ show: false, trip: null });
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState('');

  // State: Modal Thông báo thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State: Modal Xác nhận Hủy chuyến
  const [cancelModal, setCancelModal] = useState({ show: false, tripId: null });

  // Polling
  useEffect(() => {
    const fetchTrips = () => {
      mockService.getTripHistory('u1').then(setTrips);
    };
    fetchTrips();
    const intervalId = setInterval(fetchTrips, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const activeTrips = trips.filter(t => ['pending', 'accepted', 'arriving', 'running'].includes(t.status));
  const pastTrips = trips.filter(t => ['completed', 'cancelled'].includes(t.status));

  // --- LOGIC XỬ LÝ ---

  const handleRebook = (trip) => {
    navigate('/passenger/booking', { state: { pickup: trip.from, destination: trip.to, rebookPrice: trip.price } });
  };

  // Mở modal xác nhận hủy
  const onRequestCancel = (tripId) => {
    setCancelModal({ show: true, tripId });
  };

  // Xác nhận hủy thật
  const handleConfirmCancel = async () => {
    if (!cancelModal.tripId) return;
    try {
        await mockService.cancelTrip(cancelModal.tripId);
        setCancelModal({ show: false, tripId: null });
        mockService.getTripHistory('u1').then(setTrips); // Refresh ngay
    } catch (error) {
        alert(error.message); // Thông báo lỗi từ mockApi nếu cố tình hủy sai luật
        setCancelModal({ show: false, tripId: null });
    }
  };

  const handleSubmitReview = async () => {
    if (!ratingModal.trip) return;
    await mockService.submitReview(ratingModal.trip.id, star, comment);
    setRatingModal({ show: false, trip: null });
    setShowSuccessModal(true);
    mockService.getTripHistory('u1').then(setTrips);
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse">⏳ Đang tìm xe</span>;
        case 'accepted': return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">🚕 Tài xế đã nhận</span>;
        case 'arriving': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">📍 Tài xế đang đến</span>;
        case 'running': return <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">🚀 Đang chạy</span>;
        case 'completed': return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">✔ Hoàn thành</span>;
        default: return <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">✕ Đã hủy</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-24 font-sans text-slate-800">
      <h1 className="text-2xl font-bold mb-6 px-4 md:px-0 pt-6">Quản lý chuyến đi</h1>

      {/* TABS */}
      <div className="flex p-1 bg-gray-100 rounded-xl mx-4 md:mx-0 mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Đang hoạt động ({activeTrips.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Lịch sử ({pastTrips.length})
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4 px-4 md:px-0">
        {(activeTab === 'active' ? activeTrips : pastTrips).map(trip => (
          <div key={trip.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  {getStatusBadge(trip.status)}
                  <p className="text-xs text-gray-400 mt-2 font-medium">{new Date(trip.date).toLocaleString('vi-VN')}</p>
               </div>
               <p className="text-lg font-extrabold text-blue-600">{trip.price}</p>
            </div>

            {/* Route */}
            <div className="space-y-4 mb-4 relative pl-2">
               <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-200 border-dashed z-0"></div>
               <div className="relative z-10 flex gap-3 items-start">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white shadow-sm shrink-0"></div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{trip.from.address}</p>
               </div>
               <div className="relative z-10 flex gap-3 items-start">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shrink-0"></div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{trip.to.address}</p>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-20">
              
              {/* --- TAB ACTIVE --- */}
              {activeTab === 'active' && (
                 <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl border border-gray-100">
                            {trip.driver ? '🤠' : '📡'}
                        </div>
                        <div>
                            {trip.driver ? (
                                <>
                                    <p className="font-bold text-sm text-gray-800">{trip.driver.name}</p>
                                    <p className="text-xs bg-gray-100 inline-block px-1 rounded text-gray-600 font-mono mt-0.5">{trip.driver.plate}</p>
                                </>
                            ) : (
                                <p className="font-bold text-sm text-gray-500 italic">Đang tìm tài xế...</p>
                            )}
                        </div>
                    </div>

                    {/* LOGIC HỦY: CHỈ HIỆN KHI PENDING */}
                    {trip.status === 'pending' ? (
                        <button 
                            onClick={() => onRequestCancel(trip.id)}
                            className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                        >
                            Hủy tìm
                        </button>
                    ) : (
                        <span className="text-xs font-medium text-gray-400 italic">Không thể hủy</span>
                    )}
                 </div>
              )}

              {/* --- TAB HISTORY --- */}
              {activeTab === 'history' && (
                <div className="flex gap-3 w-full justify-end items-center relative z-30">
                  
                  {/* LOGIC ĐÁNH GIÁ */}
                  {trip.status === 'completed' && (
                      trip.rating && trip.rating > 0 ? (
                        // Đã đánh giá -> Hiện số sao (Không click được)
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-100 cursor-default select-none">
                             <span className="text-yellow-500 text-sm">⭐</span>
                             <span className="text-sm font-bold text-yellow-700">{trip.rating} Sao</span>
                        </div>
                      ) : (
                        // Chưa đánh giá -> Nút màu vàng nổi bật
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setRatingModal({ show: true, trip });
                                setStar(5);
                                setComment('');
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer relative z-40"
                        >
                            ⭐ Đánh giá
                        </button>
                      )
                  )}
                  
                  {/* Nút Đặt lại */}
                  <button 
                    onClick={() => handleRebook(trip)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer relative z-40"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Đặt lại
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {(activeTab === 'active' ? activeTrips : pastTrips).length === 0 && (
            <div className="text-center py-12 text-gray-400 opacity-60">
                <p>Không có chuyến nào.</p>
            </div>
        )}
      </div>

      {/* --- MODAL 1: XÁC NHẬN HỦY --- */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-[24px] p-6 w-full max-w-xs shadow-2xl animate-scale-up text-center">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                 ⚠
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hủy tìm tài xế?</h3>
              <p className="text-sm text-gray-500 mb-6">Bạn có chắc muốn hủy chuyến đi này không?</p>
              
              <div className="flex gap-3">
                 <button 
                    onClick={() => setCancelModal({show: false, tripId: null})}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                 >
                    Không
                 </button>
                 <button 
                    onClick={handleConfirmCancel}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
                 >
                    Hủy chuyến
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL 2: NHẬP ĐÁNH GIÁ --- */}
      {ratingModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl animate-scale-up">
              <h3 className="text-lg font-bold text-center mb-1">Đánh giá chuyến đi</h3>
              <p className="text-center text-xs text-gray-400 mb-6">Trải nghiệm của bạn thế nào?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setStar(s)} className="text-4xl transition-transform hover:scale-110 active:scale-95 focus:outline-none">
                        {s <= star ? '⭐' : '⚪'}
                    </button>
                ))}
              </div>

              <textarea 
                 className="w-full p-4 bg-gray-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none resize-none"
                 rows="3"
                 placeholder="Nhập nhận xét của bạn..."
                 value={comment}
                 onChange={(e) => setComment(e.target.value)}
              ></textarea>

              <div className="flex gap-3 mt-6">
                 <button onClick={() => setRatingModal({show: false, trip: null})} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">Để sau</button>
                 <button onClick={handleSubmitReview} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Gửi đánh giá</button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL 3: THÔNG BÁO THÀNH CÔNG --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-[32px] p-8 max-w-xs w-full text-center shadow-2xl transform transition-all animate-bounce-in">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Cảm ơn bạn!</h3>
                <p className="text-sm text-gray-500 mb-8">Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>
                
                <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-4 bg-gray-900 text-white font-bold text-lg rounded-2xl hover:bg-black hover:shadow-lg transition-all active:scale-95"
                >
                    Đóng
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default TripHistory;