import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 1. CẤU HÌNH ICON ---

// Icon User: Chấm tròn xanh (Dùng CSS class gps-user-marker)
const userDotIcon = L.divIcon({
    className: 'gps-user-marker', 
    iconSize: [16, 16],           // Kích thước chấm
    iconAnchor: [8, 8],           // Tâm chấm
    popupAnchor: [0, -10]         
});

// Icon Ghim (Pin) cho điểm chọn và bến xe
const createPinIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const selectedIcon = createPinIcon('green'); // Ghim xanh cho điểm chọn
const stationIcon = createPinIcon('gold');   // Ghim vàng cho bến xe

// --- 2. XỬ LÝ CLICK ---
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect({ 
                    lat: e.latlng.lat, 
                    lng: e.latlng.lng 
                });
            }
        },
    });
    return null;
};

// --- 3. CAMERA CONTROLLER ---
const MapController = ({ center, userPos, isTracking }) => {
    const map = useMap();
    const lastFlyRef = useRef(null);

    useEffect(() => {
        // Ưu tiên 1: Bay theo User (Tracking Mode)
        if (isTracking && userPos) {
            map.flyTo([userPos.lat, userPos.lng], 16, { animate: true, duration: 0.8 });
            lastFlyRef.current = `${userPos.lat},${userPos.lng}`;
            return;
        }

        // Ưu tiên 2: Bay đến điểm chọn (Selected Point)
        if (center && center.lat && center.lng) {
            const centerKey = `${center.lat},${center.lng}`;
            if (lastFlyRef.current !== centerKey) {
                map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.2 });
                lastFlyRef.current = centerKey;
            }
        }
    }, [center, userPos, isTracking, map]);

    return null;
};

// --- MAIN COMPONENT ---
const AppMap = ({ 
    stationLocation,    // Bến xe (Cố định)
    selectedLocation,   // Điểm khách chọn (Ghim xanh)
    isGoingToStation,   // Chiều đi
    onLocationSelect    // Hàm callback click
}) => {
    // State lưu vị trí user + độ chính xác (accuracy)
    const [currentPos, setCurrentPos] = useState(null); 
    const [isTracking, setIsTracking] = useState(true); 
    const watchIdRef = useRef(null);
    
    // Mặc định hiển thị Bến xe nếu chưa có GPS
    const defaultCenter = [stationLocation.lat, stationLocation.lng]; 

    // --- LOGIC GPS ---
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Trình duyệt không hỗ trợ GPS");
            return;
        }

        // watchPosition: Lấy vị trí liên tục
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                // Lưu cả độ chính xác (accuracy - mét)
                setCurrentPos({ lat: latitude, lng: longitude, accuracy });
            },
            (error) => {
                console.warn("Lỗi GPS:", error.message);
                // Nếu lỗi, có thể thử lại hoặc để yên
            },
            { 
                enableHighAccuracy: true, // Bắt buộc để chính xác nhất
                timeout: 10000, 
                maximumAge: 0 
            }
        );

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // Tắt tracking khi người dùng chọn điểm khác
    useEffect(() => {
        if (selectedLocation) {
            setIsTracking(false);
        }
    }, [selectedLocation]);

    // Tính toán tâm bản đồ ban đầu
    const mapCenter = (selectedLocation && selectedLocation.lat) 
        ? [selectedLocation.lat, selectedLocation.lng] 
        : (currentPos ? [currentPos.lat, currentPos.lng] : defaultCenter);

    return (
        <div className="w-full h-full z-0 bg-gray-100 relative">
            <MapContainer 
                center={mapCenter} 
                zoom={14} 
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                onDragStart={() => setIsTracking(false)}
            >
                <TileLayer
                    attribution='&copy; OSM'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onLocationSelect={onLocationSelect} />

                <MapController 
                    center={selectedLocation} 
                    userPos={currentPos} 
                    isTracking={isTracking} 
                />

                {/* 1. BẾN XE MIỀN TÂY (Cố định) */}
                <Marker 
                    position={[stationLocation.lat, stationLocation.lng]} 
                    icon={stationIcon}
                    zIndexOffset={50}
                >
                    <Popup><b>🏁 {stationLocation.address}</b></Popup>
                </Marker>

                {/* 2. VỊ TRÍ USER (Realtime) */}
                {currentPos && (
                    <>
                        {/* Vòng tròn sai số (Accuracy Circle) */}
                        <Circle 
                            center={[currentPos.lat, currentPos.lng]}
                            radius={currentPos.accuracy} // Bán kính = độ sai số (mét)
                            pathOptions={{ 
                                color: '#4285F4', 
                                fillColor: '#4285F4', 
                                fillOpacity: 0.15, 
                                weight: 1,
                                opacity: 0.5
                            }}
                        />
                        {/* Chấm xanh tâm */}
                        <Marker 
                            position={[currentPos.lat, currentPos.lng]} 
                            icon={userDotIcon} 
                            zIndexOffset={1000} // Luôn nổi trên cùng
                        >
                            <Popup>Vị trí của bạn (Sai số: {Math.round(currentPos.accuracy)}m)</Popup>
                        </Marker>
                    </>
                )}

                {/* 3. ĐIỂM KHÁCH CHỌN (Ghim Xanh) */}
                {selectedLocation && selectedLocation.lat && (
                    <Marker 
                        position={[selectedLocation.lat, selectedLocation.lng]} 
                        icon={selectedIcon} 
                        zIndexOffset={500}
                    >
                        <Popup>{selectedLocation.address}</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Nút "Bám theo tôi" */}
            {!isTracking && currentPos && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsTracking(true);
                    }}
                    className="absolute bottom-28 left-4 z-[1000] bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-50 border border-blue-100 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Bám theo tôi
                </button>
            )}
        </div>
    );
};

export default AppMap;