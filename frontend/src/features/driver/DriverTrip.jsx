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

    // 2. LOGIC LOAD DỮ LIỆU
    useEffect(() => {
        const checkAndLoadTrip = async () => {
            const storedTrip = JSON.parse(localStorage.getItem('DRIVER_ACTIVE_TRIP'));

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

            if (storedTrip.fullRouteData) {
                setTripData(storedTrip.fullRouteData);
                setCurrentStageIndex(storedTrip.stageIndex || 0);
                
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

            try {
                const data = await mockDriverService.startOptimizedTrip(storedTrip.timeSlot);
                setTripData(data);
                setCurrentStageIndex(0);
                setDriverPos(data.station);

                localStorage.setItem('DRIVER_ACTIVE_TRIP', JSON.stringify({
                    timeSlot: storedTrip.timeSlot,
                    stageIndex: 0,
                    fullRouteData: data 
                }));

                setLoading(false);
            } catch (error) {
                Swal.fire("Lỗi", error.message, "error").then(() => navigate('/driver/home'));
            }
        };

        checkAndLoadTrip();
    }, [navigate]);

    // 3. XỬ LÝ HOÀN THÀNH (NÚT XANH)
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
            confirmButtonColor: '#10B981'
        }).then((result) => {
            if (result.isConfirmed) {
                processNextStage(isLastStage, 'completed');
            }
        });
    };

    // 4. XỬ LÝ HỦY/THẤT BẠI (NÚT ĐỎ)
    const handleFailStage = () => {
        if (!tripData) return;
        
        const destination = tripData.route[currentStageIndex];
        const isLastStage = currentStageIndex === tripData.route.length - 1;

        Swal.fire({
            title: `Khách ${destination.passenger.name} vắng mặt?`,
            text: "Xác nhận đánh dấu THẤT BẠI cho khách này?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đúng, Hủy khách',
            confirmButtonColor: '#EF4444',
            cancelButtonText: 'Không'
        }).then((result) => {
            if (result.isConfirmed) {
                processNextStage(isLastStage, 'failed');
            }
        });
    };

    // Hàm chung xử lý chuyển chặng
    const processNextStage = (isLastStage, status) => {
        if (isLastStage) {
            localStorage.removeItem('DRIVER_ACTIVE_TRIP');
            const msg = status === 'completed' ? "Hoàn thành chuyến đi!" : "Kết thúc chuyến (có khách hủy).";
            Swal.fire("Kết thúc", msg, "success")
                .then(() => navigate('/driver/home'));
        } else {
            const newIndex = currentStageIndex + 1;
            setCurrentStageIndex(newIndex);
            
            const destination = tripData.route[currentStageIndex]; 
            setDriverPos({ lat: destination.lat, lng: destination.lng });

            const currentStore = JSON.parse(localStorage.getItem('DRIVER_ACTIVE_TRIP'));
            localStorage.setItem('DRIVER_ACTIVE_TRIP', JSON.stringify({
                ...currentStore,
                stageIndex: newIndex
            }));
        }
    };
    
    // --- RENDER ---
    if (loading || !tripData) return (
        <div className="h-screen w-full bg-slate-100 flex items-center justify-center flex-col gap-4">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu hành trình...</p>
        </div>
    );

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
                    selectedLocation={destination} 
                    userLocation={driverPos}
                />
            </div>

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 md:pt-4 pointer-events-none z-10">
                <div className="flex justify-between items-start pointer-events-auto">
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

                    {/* ACTIONS BUTTONS: Grid 3 cột theo thứ tự yêu cầu */}
                    <div className="grid grid-cols-3 gap-3">
                        
                        {/* 1. NÚT BẢN ĐỒ (Trái) */}
                        <button 
                            onClick={openGoogleMaps}
                            className="py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">🗺️</span>
                            <span className="text-[10px] font-bold uppercase">Bản đồ</span>
                        </button>

                        {/* 2. NÚT HOÀN THÀNH (Giữa - Xanh) */}
                        <button 
                            onClick={handleCompleteStage}
                            className="py-4 bg-blue-600 text-white font-bold rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">✅</span>
                            <span className="text-[10px] font-bold uppercase">Xong khách</span>
                        </button>

                        {/* 3. NÚT HỦY KHÁCH (Phải - Đỏ) */}
                        <button 
                            onClick={handleFailStage}
                            className="py-4 bg-red-50 border border-red-100 text-red-500 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-red-100 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">🚫</span>
                            <span className="text-[10px] font-bold uppercase">Hủy khách</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DriverTrip;