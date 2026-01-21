import React, { useState, useMemo, useEffect } from 'react';
import AppMap from "../map/AppMap"; 
import { mockService } from '../../services/mockApi';

// 👇 CẬP NHẬT: Tọa độ Bến xe Miền Tây (Kinh Dương Vương, Bình Tân)
const BEN_XE_MIEN_TAY = {
  lat: 10.742336, 
  lng: 106.613876,
  address: "Bến xe Miền Tây (395 Kinh Dương Vương)"
};

const PassengerHome = () => {
  // 'selectedPoint' là điểm khách chọn (khác bến xe)
  // Mặc định null, khi GPS có thì fill vào, hoặc user click map
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  const [isGoingToStation, setIsGoingToStation] = useState(false); // False = Rời bến (Mặc định)
  const [isBooking, setIsBooking] = useState(false);
  const [locating, setLocating] = useState(false);

  // API lấy tên đường
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
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const addressName = await getAddressFromNominatim(lat, lng);
        
        // Cập nhật điểm chọn bằng vị trí hiện tại
        setSelectedPoint({ lat, lng, address: addressName });
        setLocating(false);
      },
      (error) => {
        console.error("Lỗi GPS:", error);
        setLocating(false);
      }
    );
  };

  // Khi click vào bản đồ -> Cập nhật điểm chọn
  const handleMapClick = async ({ lat, lng }) => {
    setSelectedPoint({ lat, lng, address: "Đang lấy địa chỉ..." });
    const addressName = await getAddressFromNominatim(lat, lng);
    setSelectedPoint({ lat, lng, address: addressName });
  };

  // Logic hiển thị trên Panel (Input)
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
        distance: "Calculating...", 
        price: "Estimating..."
      });
      alert(`🎉 Đặt thành công!\nTừ: ${pickup.address}\nĐến: ${destination.address}`);
      setSelectedPoint(null); // Reset
    } catch (error) {
      alert(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans bg-gray-50">
      
      {/* 1. BẢN ĐỒ */}
      <div className="absolute inset-0 z-0">
        <AppMap 
          // 3 Điểm quan trọng
          userLocation={null} // AppMap tự lo việc lấy GPS realtime
          stationLocation={BEN_XE_MIEN_TAY} // Điểm cố định
          selectedLocation={selectedPoint}  // Điểm linh hoạt
          
          isGoingToStation={isGoingToStation}
          onLocationSelect={handleMapClick}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none md:hidden" />
      </div>

      {/* 2. NÚT ĐỊNH VỊ */}
      <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 z-20">
        <button 
          onClick={handleGetLocation} 
          className="group bg-white p-4 rounded-full shadow-xl border border-gray-100 text-gray-600 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
        >
          <svg className={`h-6 w-6 ${locating ? 'animate-spin text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* 3. PANEL ĐẶT XE */}
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

          <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner">
            <div className="absolute left-[29px] top-[34px] bottom-[34px] w-[2px] border-l-2 border-dashed border-gray-300 z-0 pointer-events-none"></div>

            {/* ĐIỂM ĐÓN */}
            <div className={`relative z-10 flex items-center gap-4 mb-4 ${!pickup ? 'opacity-50' : 'opacity-100'}`}>
              <div className="w-4 h-4 rounded-full border-[3px] border-blue-500 bg-white shadow-sm flex-shrink-0"></div>
              <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Điểm đón</p>
                <p className="text-sm font-bold text-gray-800 break-words line-clamp-2 leading-tight">
                  {pickup ? pickup.address : "..."}
                </p>
              </div>
            </div>

            {/* ĐIỂM ĐẾN */}
            <div className={`relative z-10 flex items-center gap-4 ${!destination ? 'opacity-50' : 'opacity-100'}`}>
              <div className="w-4 h-4 flex-shrink-0 text-red-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-sm"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              </div>
              <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Điểm trả</p>
                <p className="text-sm font-bold text-gray-800 break-words line-clamp-2 leading-tight">
                  {destination ? destination.address : "..."}
                </p>
              </div>
            </div>

            {/* NÚT ĐẢO CHIỀU */}
            <button 
              onClick={() => setIsGoingToStation(!isGoingToStation)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all z-20"
              title="Đảo chiều"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleBooking}
              disabled={!selectedPoint || isBooking}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${(!selectedPoint || isBooking) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:-translate-y-1'}`}
            >
              {isBooking ? "Đang xử lý..." : "Đặt Chuyến Xe"}
            </button>
            {!selectedPoint && (
              <p className="mt-4 text-center text-xs font-medium text-gray-400 animate-pulse">
                👇 Chọn điểm {isGoingToStation ? 'đón' : 'trả'} trên bản đồ
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;