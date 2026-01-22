import React, { useState, useEffect } from 'react';
import AppMap from '../map/AppMap';
import { mockService } from '../../core/services/mockApi';

// Vị trí giả lập ban đầu cho tài xế
const DRIVER_START_POS = { lat: 10.742500, lng: 106.614000, address: "Vị trí hiện tại" };

const DriverHome = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null); 
  const [tripStatus, setTripStatus] = useState('idle');

  return (
    <div className="relative h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">🤠</div>
          <div>
            <h2 className="font-bold text-gray-800">Tài xế</h2>
            <p className="text-xs text-gray-500">{isOnline ? '🟢 Đang hoạt động' : '⚫ Đang nghỉ'}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
            isOnline ? 'bg-red-100 text-red-600' : 'bg-green-600 text-white'
          }`}
        >
          {isOnline ? "Tắt nhận chuyến" : "Bắt đầu chạy"}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative z-0">
        <AppMap 
            stationLocation={currentTrip ? currentTrip.from : DRIVER_START_POS}
            selectedLocation={currentTrip ? currentTrip.to : null}
        />
      </div>
    </div>
  );
};

export default DriverHome;