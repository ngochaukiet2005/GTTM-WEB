// frontend/src/features/map/AppMap.jsx

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- SOCKET IMPORT (Thay thế Firebase) ---
import { io } from "socket.io-client";

// --- 1. CẤU HÌNH ICON ---

// Icon User: Chấm tròn xanh
const userDotIcon = L.divIcon({
    className: 'gps-user-marker', 
    iconSize: [20, 20],           
    iconAnchor: [10, 10],         
    popupAnchor: [0, -10]         
});

// Icon Xe Bus/Tài xế
const driverIcon = L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(2px 4px 6px black);">🚌</div>`,
    className: 'driver-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

// Icon Ghim
const createPinIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const selectedIcon = createPinIcon('green'); 
const stationIcon = createPinIcon('gold');  

// --- 2. MAP CONTROLLER & EVENTS ---

const MapController = ({ center, userPos, isTracking, onDragStart }) => {
    const map = useMap();
    const prevPosRef = useRef(null);

    // Xử lý sự kiện kéo map để tắt tracking
    useMapEvents({
        dragstart: () => {
            onDragStart && onDragStart();
        },
        click: (e) => {
           // Logic click map nếu cần
        }
    });

    useEffect(() => {
        // Ưu tiên 1: Bay đến điểm chọn (CHỈ KHI CÓ LAT/LNG HỢP LỆ)
        if (center && typeof center.lat === 'number' && typeof center.lng === 'number' && !isTracking) {
             map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.0 });
             return;
        }

        // Ưu tiên 2: Bám theo User (Tracking Mode)
        if (isTracking && userPos && typeof userPos.lat === 'number') {
            const shouldMove = !prevPosRef.current || 
                map.distance([userPos.lat, userPos.lng], prevPosRef.current) > 2;

            if (shouldMove) {
                map.panTo([userPos.lat, userPos.lng], { animate: true, duration: 0.5 });
                prevPosRef.current = [userPos.lat, userPos.lng];
            }
        }
    }, [center, userPos, isTracking, map]);

    return null;
};

// --- MAIN COMPONENT ---

const AppMap = ({ 
    stationLocation,    
    selectedLocation,   
    onLocationSelect,
    driverId // ID tài xế để theo dõi
}) => {
    const [currentPos, setCurrentPos] = useState(null); 
    const [driverPos, setDriverPos] = useState(null); 
    const [isTracking, setIsTracking] = useState(true); 
    const watchIdRef = useRef(null);
    
    // Ref giữ kết nối socket
    const socketRef = useRef(null);

    // Mặc định hiển thị Bến xe Miền Tây nếu chưa có vị trí
    const defaultCenter = [10.742336, 106.613876]; 

    // --- LOGIC GPS USER ---
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Trình duyệt không hỗ trợ GPS");
            return;
        }

        const geoOptions = { 
            enableHighAccuracy: true,
            timeout: 10000,           
            maximumAge: 0             
        };

        const success = (position) => {
            const { latitude, longitude, accuracy, heading } = position.coords;
            setCurrentPos({ lat: latitude, lng: longitude, accuracy, heading });
        };

        const error = (err) => {
            console.warn("Lỗi GPS:", err.message);
        };

        watchIdRef.current = navigator.geolocation.watchPosition(success, error, geoOptions);

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // --- LOGIC TRACKING TÀI XẾ (SOCKET.IO) ---
    useEffect(() => {
        if (!driverId) {
            setDriverPos(null);
            return;
        }

        // 1. Kết nối đến Server Socket (Backend đang chạy port 5000)
        // Lưu ý: Cấu hình URL này nên đưa vào biến môi trường trong thực tế
        socketRef.current = io("http://localhost:5000");

        // 2. Lắng nghe sự kiện cập nhật vị trí
        const eventName = `driver_location_${driverId}`;
        
        socketRef.current.on(eventName, (data) => {
            // console.log("⚡ Socket Update:", data);
            if (data && data.lat && data.lng) {
                setDriverPos({ lat: data.lat, lng: data.lng });
            }
        });

        // 3. Cleanup khi component unmount hoặc đổi tài xế
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [driverId]);

    // Tự động tắt tracking khi người dùng chọn một điểm khác trên map
    useEffect(() => {
        if (selectedLocation) {
            setIsTracking(false);
        }
    }, [selectedLocation]);

    // Xử lý click chọn điểm trên map
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (onLocationSelect) {
                    onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
                }
                setIsTracking(false); 
            },
        });
        return null;
    };

    // Tính toán tâm khởi tạo an toàn
    const initialCenter = (currentPos && currentPos.lat) ? [currentPos.lat, currentPos.lng] : defaultCenter;

    return (
        <div className="w-full h-full z-0 bg-gray-100 relative">
            <MapContainer 
                center={initialCenter} 
                zoom={15} 
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OSM'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler />

                <MapController 
                    center={selectedLocation} 
                    userPos={currentPos} 
                    isTracking={isTracking}
                    onDragStart={() => setIsTracking(false)} 
                />

                {/* 1. ĐIỂM CỐ ĐỊNH (Bến xe) */}
                {stationLocation && stationLocation.lat && (
                    <Marker position={[stationLocation.lat, stationLocation.lng]} icon={stationIcon}>
                        <Popup><b>🏁 {stationLocation.address || "Điểm mốc"}</b></Popup>
                    </Marker>
                )}

                {/* 2. VỊ TRÍ USER (Realtime) */}
                {currentPos && (
                    <>
                        <Circle 
                            center={[currentPos.lat, currentPos.lng]}
                            radius={currentPos.accuracy || 20} 
                            pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.1, weight: 1, opacity: 0.3 }}
                        />
                        <Marker 
                            position={[currentPos.lat, currentPos.lng]} 
                            icon={userDotIcon} 
                            zIndexOffset={1000}
                        >
                            <Popup>Bạn đang ở đây</Popup>
                        </Marker>
                    </>
                )}

                {/* 3. VỊ TRÍ TÀI XẾ (REALTIME SOCKET) */}
                {driverPos && (
                    <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon} zIndexOffset={900}>
                        <Popup>
                            <div className="text-center">
                                <b>Tài xế đang đến!</b><br/>
                                <span className="text-xs text-gray-500">Đang di chuyển...</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* 4. ĐIỂM ĐÃ CHỌN */}
                {selectedLocation && selectedLocation.lat && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
                        <Popup>{selectedLocation.address}</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Nút "Bám theo tôi" */}
            {!isTracking && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsTracking(true);
                    }}
                    className="absolute bottom-28 left-4 z-[400] bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-50 border border-blue-100 transition-all animate-fade-in-up"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Về vị trí của tôi
                </button>
            )}
        </div>
    );
};

export default AppMap;