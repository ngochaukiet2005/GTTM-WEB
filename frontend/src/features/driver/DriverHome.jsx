import React, { useState, useEffect } from 'react';
import AppMap from '../map/AppMap';
import { mockService } from '../../core/services/mockApi';

const DRIVER_INFO = {
    name: "Trần Tài Xế",
    plate: "59X1-999.99",
    phone: "0909123456"
};

const DriverHome = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingTrips, setPendingTrips] = useState([]);
  
  // Polling tìm chuyến mới
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
        mockService.getPendingTrips().then(trips => {
            setPendingTrips(trips);
        });
    }, 2000); // Quét chuyến mới mỗi 2s

    return () => clearInterval(interval);
  }, [isOnline]);

  const handleAcceptTrip = async (tripId) => {
    try {
        await mockService.acceptTrip(tripId, DRIVER_INFO);
        alert("Đã nhận chuyến! Hệ thống sẽ tự động điều hướng...");
        // Ở đây bạn có thể chuyển sang trang DriverTrip
        // navigate('/driver/trip'); 
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
  };

  return (
    <div className="relative h-screen w-full bg-gray-100 flex flex-col">
       {/* ... (Header Map giữ nguyên) */}

       {/* 👇 DANH SÁCH CHUYẾN ĐANG CHỜ (Hiện đè lên Map) */}
       {isOnline && pendingTrips.length > 0 && (
         <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-3xl shadow-2xl z-30 animate-slide-up">
            <h3 className="font-bold text-lg mb-4">🔥 Có {pendingTrips.length} chuyến mới!</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {pendingTrips.map(trip => (
                    <div key={trip.id} className="border border-gray-200 p-3 rounded-xl bg-gray-50 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-800">Đón: {trip.from.address}</p>
                            <p className="text-xs text-gray-500">Đến: {trip.to.address}</p>
                            <p className="text-blue-600 font-bold mt-1">{trip.price}</p>
                        </div>
                        <button 
                            onClick={() => handleAcceptTrip(trip.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg"
                        >
                            Nhận
                        </button>
                    </div>
                ))}
            </div>
         </div>
       )}
    </div>
  );
};

export default DriverHome;