import React, { useState } from 'react';
// Đảm bảo đường dẫn import này đúng với nơi bạn đặt file AppMap
import AppMap from "../map/AppMap"; // Hoặc đường dẫn chính xác tới nơi bạn để file

// 👇 QUAN TRỌNG: Phải có dòng khai báo hàm này
const PassengerHome = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [step, setStep] = useState('pickup'); // 'pickup' | 'destination' | 'confirm'

  // Xử lý khi khách click vào bản đồ
  const handleLocationSelect = (type, location) => {
    if (step === 'pickup') {
      setPickup(location);
      setStep('destination'); // Tự động chuyển sang chọn điểm đến
    } else if (step === 'destination') {
      setDestination(location);
      setStep('confirm'); // Chuyển sang xác nhận
    }
  };

  const handleReset = () => {
    setPickup(null);
    setDestination(null);
    setStep('pickup');
  };

  const handleBooking = () => {
    // Sau này sẽ gọi API đặt chuyến ở đây
    alert("Đã gửi yêu cầu đặt xe thành công! (Demo)");
  };

  // 👇 Lệnh return phải nằm TRONG hàm PassengerHome
  return (
    <div className="relative h-screen w-full overflow-hidden">
      
      {/* 1. BẢN ĐỒ NỀN */}
      <div className="absolute inset-0 z-0">
        {/* Component AppMap nhận vào các props để hiển thị */}
        <AppMap 
          mode="passenger"
          pickupLocation={pickup}
          destinationLocation={destination}
          selectingType={step === 'pickup' ? 'pickup' : 'destination'}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {/* 2. UI ĐIỀU KHIỂN (Nổi bên trên bản đồ) */}
      <div className="absolute top-4 left-4 right-4 md:left-10 md:w-96 z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 transition-all border border-gray-100">
          
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            {step === 'pickup' && "📍 Chọn điểm đón"}
            {step === 'destination' && "🏁 Chọn điểm đến"}
            {step === 'confirm' && "✅ Xác nhận chuyến đi"}
          </h1>

          {/* Hiển thị toạ độ */}
          <div className="space-y-3 mb-6">
            <div className={`p-3 rounded-lg border ${step === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Điểm đón (A)</span>
              <p className="text-sm font-medium text-gray-700 truncate">
                {pickup ? `${pickup.lat.toFixed(5)}, ${pickup.lng.toFixed(5)}` : "Chạm vào bản đồ để chọn..."}
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step === 'destination' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Điểm đến (B)</span>
              <p className="text-sm font-medium text-gray-700 truncate">
                {destination ? `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}` : "Chưa chọn..."}
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3">
            {step === 'confirm' ? (
              <>
                <button 
                  onClick={handleReset}
                  className="flex-1 py-3 text-gray-600 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Chọn lại
                </button>
                <button 
                  onClick={handleBooking}
                  className="flex-1 py-3 text-white bg-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all animate-pulse"
                >
                  Đặt Xe
                </button>
              </>
            ) : (
              <button 
                onClick={handleReset}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 underline py-2"
              >
                Làm mới bản đồ
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}; // 👈 Đừng quên dấu đóng ngoặc này

export default PassengerHome;