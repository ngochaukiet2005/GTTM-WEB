// src/features/driver/DriverTrip.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppMap from '../map/AppMap';
import Swal from 'sweetalert2';
import { mockDriverService } from '../../core/services/mockApiDriver';

const DriverTrip = () => {
    const navigate = useNavigate();

    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [tripData, setTripData] = useState(null);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [driverPos, setDriverPos] = useState({ lat: 10.742336, lng: 106.613876 }); 
    const [loading, setLoading] = useState(true);

    // 2. KHỞI TẠO: Kiểm tra LocalStorage
    useEffect(() => {
        const storedTrip = JSON.parse(localStorage.getItem('DRIVER_ACTIVE_TRIP'));

        // NẾU KHÔNG CÓ CHUYẾN NÀO ĐANG CHẠY -> ĐÁ VỀ HOME
        if (!storedTrip) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa có chuyến đi!',
                text: 'Bạn chưa thực hiện chuyến nào. Vui lòng chọn từ Bảng điều khiển.',
                confirmButtonText: 'Quay về trang chủ',
                allowOutsideClick: false
            }).then(() => {
                navigate('/driver/home');
            });
            return;
        }

        // CÓ CHUYẾN -> LOAD DỮ LIỆU
        const loadRoute = async () => {
            try {
                const data = await mockDriverService.startOptimizedTrip(storedTrip.timeSlot);
                setTripData(data);
                // Khôi phục lại chặng đang đi dở (Stage Index)
                setCurrentStageIndex(storedTrip.stageIndex || 0);
                
                // Set vị trí giả lập (Nếu là chặng 0 thì ở Bến, còn không thì ở điểm trước đó)
                if (storedTrip.stageIndex > 0) {
                     const prevStop = data.route[storedTrip.stageIndex - 1];
                     setDriverPos({ lat: prevStop.lat, lng: prevStop.lng });
                } else {
                     setDriverPos(data.station);
                }
                setLoading(false);
            } catch (error) {
                Swal.fire("Lỗi", error.message, "error").then(() => navigate('/driver/home'));
            }
        };
        loadRoute();
    }, [navigate]);

    // 3. XỬ LÝ KHI HOÀN THÀNH 1 CHẶNG
    const handleCompleteStage = () => {
        const destination = tripData.route[currentStageIndex];
        const isLastStage = currentStageIndex === tripData.route.length - 1;

        Swal.fire({
            title: `Đã xong khách ${destination.passenger.name}?`,
            text: isLastStage ? "Đây là khách cuối cùng của chuyến này." : "Hệ thống sẽ chuyển sang điểm đón tiếp theo.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận xong',
            confirmButtonColor: '#2563eb'
        }).then((result) => {
            if (result.isConfirmed) {
                if (isLastStage) {
                    // HOÀN THÀNH TOÀN BỘ -> XÓA LOCALSTORAGE
                    localStorage.removeItem('DRIVER_ACTIVE_TRIP');
                    
                    Swal.fire("Tuyệt vời!", "Đã hoàn thành chuyến đi!", "success")
                    .then(() => navigate('/driver/home'));
                } else {
                    // CHUYỂN SANG CHẶNG TIẾP THEO -> CẬP NHẬT LOCALSTORAGE
                    const newIndex = currentStageIndex + 1;
                    setCurrentStageIndex(newIndex);
                    setDriverPos({ lat: destination.lat, lng: destination.lng });

                    // Lưu lại state mới
                    const currentStore = JSON.parse(localStorage.getItem('DRIVER_ACTIVE_TRIP'));
                    localStorage.setItem('DRIVER_ACTIVE_TRIP', JSON.stringify({
                        ...currentStore,
                        stageIndex: newIndex
                    }));
                }
            }
        });
    };
    
    // --- RENDER ---
    if (loading || !tripData) return <div className="h-screen w-full bg-slate-100"></div>;

    // Logic lấy điểm đi - điểm đến
    const origin = currentStageIndex === 0 ? tripData.station : tripData.route[currentStageIndex - 1];
    const destination = tripData.route[currentStageIndex];

    const openGoogleMaps = () => {
        if (!origin || !destination) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div className="relative h-screen w-full bg-slate-100 flex flex-col font-sans">
            
            {/* Map View */}
            <div className="flex-1 relative z-0">
                <AppMap 
                    stationLocation={origin} 
                    selectedLocation={destination} 
                    userLocation={origin} 
                />
            </div>

            {/* Header Info (Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 md:pt-4 bg-gradient-to-b from-black/60 to-transparent text-white z-10 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    {/* Nút Back: Về Home nhưng KHÔNG mất chuyến */}
                    <button onClick={() => navigate('/driver/home')} className="bg-white/20 p-2 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-green-500 text-[10px] font-bold uppercase mb-1">Đang thực hiện</span>
                        <p className="text-lg font-bold leading-none">Khách {currentStageIndex + 1} / {tripData.route.length}</p>
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="bg-white rounded-t-[32px] shadow-[0_-5px_30px_rgba(0,0,0,0.15)] z-20 animate-slide-up pb-safe">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2"></div>
                
                <div className="p-6 pt-2 pb-8">
                    <div className="mb-6">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">
                            Điểm đến tiếp theo ({currentStageIndex === 0 ? 'Từ Bến xe' : 'Từ điểm trước'})
                        </p>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <div className="relative shrink-0">
                                <img src={destination.passenger.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" alt="" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {currentStageIndex + 1}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{destination.passenger.name}</h3>
                                <p className="text-sm text-slate-500 truncate font-medium">{destination.address}</p>
                            </div>
                            <a href={`tel:${destination.passenger.phone}`} className="w-11 h-11 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                        <button 
                            onClick={openGoogleMaps}
                            className="col-span-2 py-4 bg-white border-2 border-slate-100 hover:border-slate-300 text-slate-700 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
                            <span className="text-[10px] uppercase font-extrabold tracking-wide">Chỉ đường</span>
                        </button>

                        <button 
                            onClick={handleCompleteStage}
                            className="col-span-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                        >
                            <span className="text-xl">✅</span>
                            <span className="text-sm">XONG KHÁCH NÀY</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverTrip;