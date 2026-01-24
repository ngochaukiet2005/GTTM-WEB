// src/features/driver/DriverTrip.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppMap from '../map/AppMap';
import Swal from 'sweetalert2';
import { mockDriverService } from '../../core/services/mockApiDriver';

const DriverTrip = () => {
    const navigate = useNavigate();

    // 1. STATE
    const [tripData, setTripData] = useState(null);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [driverPos, setDriverPos] = useState(null); 
    const [loading, setLoading] = useState(true);

    // 2. LOGIC LOAD DỮ LIỆU THÔNG MINH
    useEffect(() => {
        const checkAndLoadTrip = async () => {
            // Lấy dữ liệu thô từ LocalStorage (Do trang Home gán vào)
            // Cấu trúc mong đợi từ Home: { timeSlot: "...", stageIndex: 0 } 
            // HOẶC cấu trúc đầy đủ nếu đã chạy rồi: { fullRouteData: {...}, stageIndex: ..., timeSlot: ... }
            const storedTrip = JSON.parse(localStorage.getItem('DRIVER_ACTIVE_TRIP'));

            // A. NẾU KHÔNG CÓ GÌ -> ĐUỔI VỀ HOME
            if (!storedTrip || !storedTrip.timeSlot) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Chưa có chuyến đi!',
                    text: 'Vui lòng chọn chuyến từ Bảng điều khiển để bắt đầu.',
                    confirmButtonText: 'Về trang chủ',
                    allowOutsideClick: false
                });
                navigate('/driver/home');
                return;
            }

            // B. NẾU ĐÃ CÓ DỮ LIỆU FULL (DO ĐÃ LOAD TRƯỚC ĐÓ) -> DÙNG LUÔN
            if (storedTrip.fullRouteData) {
                console.log("♻️ Khôi phục chuyến đi từ bộ nhớ...");
                setTripData(storedTrip.fullRouteData);
                setCurrentStageIndex(storedTrip.stageIndex || 0);
                
                // Set vị trí tài xế
                const idx = storedTrip.stageIndex || 0;
                if (idx > 0) {
                    const prev = storedTrip.fullRouteData.route[idx - 1];
                    setDriverPos({ lat: prev.lat, lng: prev.lng });
                } else {
                    setDriverPos(storedTrip.fullRouteData.station);
                }
                setLoading(false);
                return;
            }

            // C. NẾU MỚI CHỈ CÓ TIMESLOT (TỪ HOME MỚI SANG) -> GỌI API & LƯU LẠI
            try {
                console.log("🚀 Bắt đầu chuyến mới, đang tải lộ trình...");
                const data = await mockDriverService.startOptimizedTrip(storedTrip.timeSlot);
                
                // Cập nhật State
                setTripData(data);
                setCurrentStageIndex(0);
                setDriverPos(data.station);

                // 🔥 LƯU NGƯỢC VÀO LOCALSTORAGE ĐỂ PERSISTENCE
                localStorage.setItem('DRIVER_ACTIVE_TRIP', JSON.stringify({
                    timeSlot: storedTrip.timeSlot,
                    stageIndex: 0,
                    fullRouteData: data // Lưu trọn gói dữ liệu route
                }));

                setLoading(false);
            } catch (error) {
                Swal.fire("Lỗi", error.message, "error").then(() => navigate('/driver/home'));
            }
        };

        checkAndLoadTrip();
    }, [navigate]);

    // 3. XỬ LÝ HOÀN THÀNH CHẶNG
    const handleCompleteStage = () => {
        if (!tripData) return;
        
        const destination = tripData.route[currentStageIndex];
        const isLastStage = currentStageIndex === tripData.route.length - 1;

        Swal.fire({
            title: `Đã xong khách ${destination.passenger.name}?`,
            text: isLastStage ? "Đây là khách cuối cùng." : "Chuyển sang điểm tiếp theo?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            confirmButtonColor: '#10B981' // Green
        }).then((result) => {
            if (result.isConfirmed) {
                if (isLastStage) {
                    // XONG HẾT -> XÓA LOCALSTORAGE
                    localStorage.removeItem('DRIVER_ACTIVE_TRIP');
                    Swal.fire("Hoàn thành!", "Bạn đã xong chuyến này.", "success")
                        .then(() => navigate('/driver/home'));
                } else {
                    // CHUYỂN CHẶNG -> UPDATE LOCALSTORAGE
                    const newIndex = currentStageIndex + 1;
                    setCurrentStageIndex(newIndex);
                    setDriverPos({ lat: destination.lat, lng: destination.lng });

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
    if (loading || !tripData) return (
        <div className="h-screen w-full bg-slate-100 flex items-center justify-center flex-col gap-4">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu hành trình...</p>
        </div>
    );

    // Logic điểm đi - đến
    const origin = currentStageIndex === 0 ? tripData.station : tripData.route[currentStageIndex - 1];
    const destination = tripData.route[currentStageIndex];

    const openGoogleMaps = () => {
        if (!origin || !destination) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div className="relative h-screen w-full bg-slate-100 flex flex-col font-sans">
            
            {/* Map */}
            <div className="flex-1 relative z-0">
                <AppMap 
                    stationLocation={tripData.station} 
                    selectedLocation={destination} // Target marker
                    userLocation={driverPos}      // Current position marker
                />
            </div>

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 md:pt-4 pointer-events-none z-10">
                <div className="flex justify-between items-start pointer-events-auto">
                    {/* Nút Back: Chỉ quay về Home, KHÔNG XÓA CHUYẾN */}
                    <button onClick={() => navigate('/driver/home')} className="bg-white p-3 rounded-full shadow-lg text-slate-700 hover:bg-slate-50 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-100">
                        <span className="block text-[10px] font-bold text-green-600 uppercase tracking-wider text-center">Tiến độ</span>
                        <p className="text-xl font-black text-slate-800 text-center">
                            {currentStageIndex + 1} <span className="text-slate-400 text-sm font-medium">/ {tripData.route.length}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-white rounded-t-[32px] shadow-[0_-5px_30px_rgba(0,0,0,0.15)] z-20 pb-safe animate-slide-up">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2"></div>
                
                <div className="p-6 pt-2 pb-8">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3 text-center">
                        Điểm đến hiện tại
                    </p>

                    {/* Passenger Card */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                        <div className="relative shrink-0">
                             <img src={destination.passenger.avatar || `https://ui-avatars.com/api/?name=${destination.passenger.name}`} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover bg-slate-200" alt="" />
                        </div>
                        <div className="min-w-0 flex-1 pl-1">
                            <h3 className="font-bold text-lg text-slate-800 truncate">{destination.passenger.name}</h3>
                            <p className="text-sm text-slate-500 truncate font-medium">{destination.address}</p>
                        </div>
                        <a href={`tel:${destination.passenger.phone}`} className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </a>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={openGoogleMaps}
                            className="py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">🗺️</span>
                            <span>Chỉ đường</span>
                        </button>

                        <button 
                            onClick={handleCompleteStage}
                            className="py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <span>✅</span>
                            <span>{currentStageIndex === tripData.route.length - 1 ? 'HOÀN THÀNH' : 'XONG KHÁCH'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverTrip;