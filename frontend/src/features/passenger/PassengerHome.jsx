import React, { useState, useMemo, useEffect } from 'react';
import AppMap from "../map/AppMap"; 
import { mockService } from '../../services/mockApi';

const BUS_STATION_LOCATION = {
  lat: 10.762622, 
  lng: 106.660172,
  address: "Bến Xe Trung Tâm (Cố định)"
};

const PassengerHome = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [isGoingToStation, setIsGoingToStation] = useState(false); 
  const [isBooking, setIsBooking] = useState(false);
  const [locating, setLocating] = useState(false);

  // 👇 HÀM MỚI: Lấy địa chỉ từ Nominatim (Miễn phí)
  const getAddressFromNominatim = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Lấy tên đường hoặc địa chỉ hiển thị (display_name)
      return data.display_name || "Không tìm thấy tên đường";
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
      return "Lỗi kết nối bản đồ";
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  // Xử lý GPS và gọi Nominatim
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS!");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Gọi API lấy địa chỉ
        const addressName = await getAddressFromNominatim(lat, lng);
        
        setUserLocation({ lat, lng, address: addressName });
        setLocating(false);
      },
      (error) => {
        console.error("Lỗi GPS:", error);
        setLocating(false);
      }
    );
  };

  // Logic Click bản đồ: Nhận tọa độ -> Gọi API lấy địa chỉ -> Lưu state
  const handleLocationSelect = async (type, { lat, lng }) => {
    // 1. Hiển thị tạm thời trong lúc chờ API
    setUserLocation({ lat, lng, address: "Đang lấy địa chỉ..." });
    
    // 2. Gọi API Nominatim
    const addressName = await getAddressFromNominatim(lat, lng);
    
    // 3. Cập nhật lại với địa chỉ thật
    setUserLocation({ lat, lng, address: addressName });
  };

  // ... (Phần logic tính toán pickup/destination giữ nguyên) ...
  const { pickup, destination } = useMemo(() => {
    if (isGoingToStation) {
      return { pickup: userLocation, destination: BUS_STATION_LOCATION };
    } else {
      return { pickup: BUS_STATION_LOCATION, destination: userLocation };
    }
  }, [userLocation, isGoingToStation]);

  const handleBooking = async () => {
    if (!userLocation) return;
    setIsBooking(true);
    try {
      // Logic giả lập đặt xe
      await mockService.createTrip({
        passengerId: "u1",
        from: pickup,
        to: destination,
        distance: "5km",
        price: "50.000đ"
      });
      alert(`🎉 Đặt xe thành công!\nTừ: ${pickup.address}\nĐến: ${destination.address}`);
      setUserLocation(null); 
    } catch (error) {
      alert(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      
      {/* 1. BẢN ĐỒ (Leaflet) */}
      <div className="absolute inset-0 z-0">
        <AppMap 
          pickupLocation={pickup}
          destinationLocation={destination}
          center={userLocation} // Để map tự bay đến vị trí user
          selectingType={isGoingToStation ? 'pickup' : 'destination'}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {/* 2. Nút GPS */}
      <div className="absolute bottom-24 right-4 z-20">
        <button onClick={handleGetLocation} className="bg-white p-3 rounded-full shadow-lg border hover:bg-blue-50">
          <svg className={`h-6 w-6 text-blue-600 ${locating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* 3. UI Nhập liệu (Giữ nguyên UI cũ, chỉ thay đổi data binding) */}
      <div className="absolute top-4 left-4 right-4 md:left-10 md:w-96 z-10">
        <div className="bg-white rounded-xl shadow-xl p-5 border border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 mb-4">🚕 Đặt xe (OpenStreetMap)</h1>

          <div className="relative flex flex-col gap-3 mb-4">
             {/* Điểm Đón */}
             <div className={`p-3 rounded-lg border flex flex-col justify-center min-h-[60px] ${pickup ? 'bg-white border-green-500' : 'bg-gray-50 border-gray-200'}`}>
               <span className="text-[10px] font-bold text-green-600 uppercase">Điểm đón (A)</span>
               <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                 {pickup ? pickup.address : "Chờ chọn..."}
               </p>
            </div>

            {/* Nút đảo chiều */}
            <div className="absolute top-1/2 left-[calc(50%-16px)] transform -translate-y-1/2 z-20">
              <button onClick={() => setIsGoingToStation(!isGoingToStation)} className="w-8 h-8 bg-white border rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600">⇅</button>
            </div>

            {/* Điểm Trả */}
            <div className={`p-3 rounded-lg border flex flex-col justify-center min-h-[60px] ${destination ? 'bg-white border-orange-500' : 'bg-gray-50 border-gray-200'}`}>
               <span className="text-[10px] font-bold text-orange-600 uppercase">Điểm trả (B)</span>
               <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                 {destination ? destination.address : "Chờ chọn..."}
               </p>
            </div>
          </div>

          <button 
            onClick={handleBooking}
            disabled={!userLocation || isBooking}
            className={`w-full py-3 text-white font-bold rounded-lg shadow-lg ${!userLocation ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isBooking ? "Đang xử lý..." : "ĐẶT XE NGAY"}
          </button>
          
          {!userLocation && <p className="text-center text-xs text-blue-500 mt-2">👇 Chạm vào bản đồ để chọn vị trí</p>}
        </div>
      </div>
    </div>
  );
};

export default PassengerHome;