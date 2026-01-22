// src/features/passenger/PassengerBooking.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import AppMap from "../map/AppMap"; 
import { mockService } from '../../core/services/mockApi';

const BEN_XE_MIEN_TAY = {
  lat: 10.742336, 
  lng: 106.613876,
  address: "Bến xe Miền Tây (395 Kinh Dương Vương)"
};

const PassengerBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isGoingToStation, setIsGoingToStation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [locating, setLocating] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  
  // 👇 STATE MỚI: Hiển thị Modal thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getAddressFromNominatim = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : "Vị trí đã chọn";
    } catch (error) {
      console.error("Lỗi:", error);
      return "Lỗi bản đồ";
    }
  };

  useEffect(() => {
    if (location.state) {
      const { pickup, destination, rebookPrice } = location.state;
      const isFromStation = pickup.address.includes("Bến xe Miền Tây");
      
      if (isFromStation) {
         setIsGoingToStation(false);
         setSelectedPoint(destination);
      } else {
         setIsGoingToStation(true);
         setSelectedPoint(pickup);
      }
      if (rebookPrice) setEstimatedPrice(rebookPrice);
    } else {
      handleGetLocation();
    }
  }, [location]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const addressName = await getAddressFromNominatim(lat, lng);
        setSelectedPoint({ lat, lng, address: addressName });
        setLocating(false);
        setEstimatedPrice("25.000đ"); 
      },
      (error) => {
        console.error("Lỗi GPS:", error);
        setLocating(false);
      }
    );
  };

  const handleMapClick = async ({ lat, lng }) => {
    setSelectedPoint({ lat, lng, address: "Đang lấy địa chỉ..." });
    const addressName = await getAddressFromNominatim(lat, lng);
    setSelectedPoint({ lat, lng, address: addressName });
    setEstimatedPrice("Đang chờ..."); 
    setTimeout(() => setEstimatedPrice("30.000đ"), 500);
  };

  const pickup = isGoingToStation ? selectedPoint : BEN_XE_MIEN_TAY;
  const destination = isGoingToStation ? BEN_XE_MIEN_TAY : selectedPoint;

  const handleBooking = async () => {
    if (!selectedPoint) return;
    setIsBooking(true);
    try {
      await mockService.createTrip({
        passengerId: "u1",
        from: pickup,
        to: destination,
        distance: "3.5 km", 
        price: estimatedPrice || "30.000đ"
      });
      
      // 👇 THAY ĐỔI: Hiện Modal thay vì alert
      setShowSuccessModal(true);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  // Hàm chuyển sang lịch sử khi tắt Modal
  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/passenger/history'); 
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans bg-gray-50">
       <div className="absolute inset-0 z-0">
        <AppMap 
          userLocation={null} 
          stationLocation={BEN_XE_MIEN_TAY} 
          selectedLocation={selectedPoint}  
          isGoingToStation={isGoingToStation}
          onLocationSelect={handleMapClick}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none md:hidden" />
      </div>

      <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 z-20">
        <button 
          onClick={handleGetLocation} 
          className="group bg-white p-4 rounded-full shadow-xl border border-gray-100 text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
        >
          <svg className={`h-6 w-6 ${locating ? 'animate-spin text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="absolute top-4 left-4 right-4 md:left-12 md:top-12 md:w-[420px] z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 animate-fade-in-down">
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              GTTM <span className="text-blue-600">Shuttle</span>
            </h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {isGoingToStation ? "Đến Bến" : "Rời Bến"}
            </span>
          </div>

          <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner mb-6">
            <div className="absolute left-[29px] top-[34px] bottom-[34px] w-[2px] border-l-2 border-dashed border-gray-300 z-0 pointer-events-none"></div>

            <div className={`relative z-10 flex items-center gap-4 mb-4 ${!pickup ? 'opacity-50' : 'opacity-100'}`}>
              <div className="w-4 h-4 rounded-full border-[3px] border-blue-500 bg-white shadow-sm flex-shrink-0"></div>
              <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Điểm đón</p>
                <p className="text-sm font-bold text-gray-800 break-words line-clamp-2 leading-tight">
                  {pickup ? pickup.address : "..."}
                </p>
              </div>
            </div>

            <div className={`relative z-10 flex items-center gap-4 ${!destination ? 'opacity-50' : 'opacity-100'}`}>
              <div className="w-4 h-4 flex-shrink-0 text-red-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              </div>
              <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Điểm trả</p>
                <p className="text-sm font-bold text-gray-800 break-words line-clamp-2 leading-tight">
                  {destination ? destination.address : "..."}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsGoingToStation(!isGoingToStation)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <div>
            <button 
              onClick={handleBooking}
              disabled={!selectedPoint || isBooking}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-between group ${(!selectedPoint || isBooking) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:-translate-y-1'}`}
            >
              <span className="flex items-center gap-2">
                 {isBooking ? "Đang xử lý..." : "Đặt Chuyến Xe"}
              </span>
              
              {estimatedPrice && !isBooking && (
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-extrabold backdrop-blur-sm group-hover:bg-white/30 transition">
                  {estimatedPrice}
                </span>
              )}
            </button>
            
            {!selectedPoint && (
              <p className="mt-4 text-center text-xs font-medium text-gray-400 animate-pulse">
                👇 Chọn điểm {isGoingToStation ? 'đón' : 'trả'} trên bản đồ
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 👇 MODAL THÔNG BÁO THÀNH CÔNG (Overlay) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-all">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt xe thành công!</h2>
            <p className="text-gray-500 mb-8">Tài xế đang nhận chuyến. Vui lòng theo dõi trạng thái trong lịch sử.</p>
            
            <button 
              onClick={handleCloseSuccess}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-colors shadow-lg"
            >
              Xem chuyến đi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerBooking;