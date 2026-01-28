// src/features/driver/DriverTrip.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppMap from '../map/AppMap';
import Swal from 'sweetalert2';
import { apiClient } from '../../core/apiClient'; // Dùng API thật

const DriverTrip = () => {
    const navigate = useNavigate();

    // 1. STATE
    const [tripData, setTripData] = useState(null);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [driverPos, setDriverPos] = useState(null); 
    const [loading, setLoading] = useState(true);

    // 2. LOGIC LOAD DỮ LIỆU TỪ REAL API
    useEffect(() => {
        const loadTrip = async () => {
            const storedTrip = JSON.parse(localStorage.getItem('DRIVER_ACTIVE_TRIP'));

            if (!storedTrip || !storedTrip.tripId) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Chưa chọn chuyến!',
                    text: 'Vui lòng chọn chuyến từ Bảng điều khiển.',
                    confirmButtonText: 'Quay lại',
                    allowOutsideClick: false
                });
                navigate('/driver/home');
                return;
            }

            try {
                // Gọi API lấy chi tiết chuyến đi
                const res = await apiClient.getDriverTripById(storedTrip.tripId);
                const trip = res.data.trip;

                setTripData(trip);
                
                // Khôi phục vị trí chặng (nếu có lưu, hoặc tìm chặng pending đầu tiên)
                let savedIndex = storedTrip.stageIndex || 0;
                
                // Nếu muốn thông minh hơn: Tìm chặng đầu tiên chưa hoàn thành
                const pendingIndex = trip.route.findIndex(r => r.status === 'pending');
                if (pendingIndex !== -1) savedIndex = pendingIndex;

                setCurrentStageIndex(savedIndex);

                // Set vị trí ban đầu cho Map
                const currentStop = trip.route[savedIndex];
                // Lưu ý: trip.route[i].location là string địa chỉ, cần lat/lng nếu có.
                // Ở controller createTrip, ta chỉ lưu address string. 
                // Nếu AppMap cần lat/lng, ta cần đảm bảo createTrip lưu cả lat/lng.
                // Tạm thời giả định hệ thống map xử lý được hoặc mock lat/lng từ RoutingService.
                // Trong code cũ createTrip: location: booking.location.address || booking.location
                
                // Để Map hoạt động tốt, ta lấy vị trí Bến xe nếu là chặng 0
                if (savedIndex === 0) {
                    setDriverPos({ lat: 10.742336, lng: 106.613876 }); // Bến xe Miền Tây
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                Swal.fire("Lỗi", "Không thể tải dữ liệu chuyến đi", "error").then(() => navigate('/driver/home'));
            }
        };

        loadTrip();
    }, [navigate]);

    // 3. XỬ LÝ HOÀN THÀNH ĐIỂM DỪNG
    const handleCompleteStage = async () => {
        if (!tripData) return;
        
        const currentStop = tripData.route[currentStageIndex];
        const isLastStage = currentStageIndex === tripData.route.length - 1;
        
        // Xác định loại hành động dựa trên type của điểm dừng
        const actionType = currentStop.type === 'pickup' ? 'Đón' : 'Trả';
        const statusToSend = currentStop.type === 'pickup' ? 'picked_up' : 'dropped_off';

        const result = await Swal.fire({
            title: `Xác nhận ${actionType} khách?`,
            text: `Khách hàng: ${currentStop.requestId?.passengerId?.name}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            confirmButtonColor: '#10B981'
        });

        if (result.isConfirmed) {
            try {
                // Gọi API update status
                await apiClient.updateStopStatus({
                    tripId: tripData._id,
                    requestId: currentStop.requestId._id,
                    status: statusToSend
                });

                processNextStage(isLastStage, 'completed');
            } catch (error) {
                Swal.fire("Lỗi", "Cập nhật trạng thái thất bại", "error");
            }
        }
    };

    // 4. XỬ LÝ HỦY KHÁCH (NO SHOW)
    const handleFailStage = async () => {
        if (!tripData) return;
        
        const currentStop = tripData.route[currentStageIndex];
        const isLastStage = currentStageIndex === tripData.route.length - 1;

        const result = await Swal.fire({
            title: `Khách vắng mặt?`,
            text: "Xác nhận đánh dấu khách không đến (No-show)?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đúng, Hủy',
            confirmButtonColor: '#EF4444'
        });

        if (result.isConfirmed) {
            try {
                await apiClient.updateStopStatus({
                    tripId: tripData._id,
                    requestId: currentStop.requestId._id,
                    status: 'no_show'
                });
                processNextStage(isLastStage, 'failed');
            } catch (error) {
                Swal.fire("Lỗi", "Cập nhật thất bại", "error");
            }
        }
    };

    // Chuyển sang chặng kế tiếp
    const processNextStage = (isLastStage, status) => {
        if (isLastStage) {
            localStorage.removeItem('DRIVER_ACTIVE_TRIP');
            Swal.fire("Tuyệt vời!", "Bạn đã hoàn thành chuyến đi.", "success")
                .then(() => navigate('/driver/home'));
        } else {
            const newIndex = currentStageIndex + 1;
            setCurrentStageIndex(newIndex);
            
            // Cập nhật storage để nếu reload vẫn giữ đúng chặng
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
             <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
    );

    const currentStop = tripData.route[currentStageIndex];
    const passenger = currentStop.requestId?.passengerId || { name: "Khách lẻ", phone: "" };

    const openGoogleMaps = () => {
        // Dùng địa chỉ text để tìm đường nếu không có lat/lng chính xác
        const destAddress = encodeURIComponent(currentStop.location);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destAddress}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div className="relative h-screen w-full bg-slate-100 flex flex-col font-sans">
            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <AppMap 
                    stationLocation={{ lat: 10.742336, lng: 106.613876 }} // Bến xe
                    // Truyền điểm đến hiện tại cho Map hiển thị marker
                    selectedLocation={{ address: currentStop.location, lat: null, lng: null }} 
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
                        {currentStop.type === 'pickup' ? 'Điểm đón khách' : 'Điểm trả khách'}
                    </p>

                    {/* Passenger Card */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${currentStop.type === 'pickup' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                        <div className="relative shrink-0">
                             <img src={`https://ui-avatars.com/api/?name=${passenger.name}&background=random`} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover bg-slate-200" alt="" />
                        </div>
                        <div className="min-w-0 flex-1 pl-1">
                            <h3 className="font-bold text-lg text-slate-800 truncate">{passenger.name}</h3>
                            <p className="text-sm text-slate-500 truncate font-medium">{currentStop.location}</p>
                        </div>
                        <a href={`tel:${passenger.phone}`} className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </a>
                    </div>

                    {/* ACTIONS BUTTONS */}
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={openGoogleMaps}
                            className="py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">🗺️</span>
                            <span className="text-[10px] font-bold uppercase">Bản đồ</span>
                        </button>

                        <button 
                            onClick={handleCompleteStage}
                            className="py-4 bg-blue-600 text-white font-bold rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">✅</span>
                            <span className="text-[10px] font-bold uppercase">Xong</span>
                        </button>

                        <button 
                            onClick={handleFailStage}
                            className="py-4 bg-red-50 border border-red-100 text-red-500 font-bold rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-red-100 active:scale-95 transition-all"
                        >
                            <span className="text-2xl">🚫</span>
                            <span className="text-[10px] font-bold uppercase">Hủy</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverTrip;