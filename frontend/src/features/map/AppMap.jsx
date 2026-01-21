//
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 1. CẤU HÌNH ICON ---

// Icon User: Chấm tròn xanh
const userDotIcon = L.divIcon({
    className: 'gps-user-marker', 
    iconSize: [20, 20],           // Tăng kích thước nhẹ để dễ nhìn
    iconAnchor: [10, 10],         // Tâm chấm nằm chính giữa
    popupAnchor: [0, -10]         
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
           // Có thể thêm logic click map tại đây nếu cần
        }
    });

    useEffect(() => {
        // Ưu tiên 1: Bay đến điểm chọn (nếu có và không phải là vị trí user hiện tại)
        if (center && !isTracking) {
             map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.0 });
             return;
        }

        // Ưu tiên 2: Bám theo User (Tracking Mode)
        if (isTracking && userPos) {
            // Lọc nhiễu: Chỉ di chuyển map nếu khoảng cách thay đổi đáng kể (> 2 mét)
            // hoặc nếu chưa có vị trí cũ.
            const shouldMove = !prevPosRef.current || 
                map.distance([userPos.lat, userPos.lng], prevPosRef.current) > 2;

            if (shouldMove) {
                // panTo mượt hơn flyTo cho khoảng cách gần
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
    onLocationSelect    
}) => {
    const [currentPos, setCurrentPos] = useState(null); 
    const [isTracking, setIsTracking] = useState(true); 
    const watchIdRef = useRef(null);
    
    // Mặc định hiển thị Bến xe
    const defaultCenter = [stationLocation.lat, stationLocation.lng]; 

    // --- LOGIC GPS TỐI ƯU ---
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Trình duyệt không hỗ trợ GPS");
            return;
        }

        // Options tối ưu cho realtime tracking
        const geoOptions = { 
            enableHighAccuracy: true, // Quan trọng: Bắt buộc dùng chip GPS
            timeout: 10000,           // Thời gian chờ tối đa
            maximumAge: 0             // Không dùng cache vị trí cũ
        };

        const success = (position) => {
            const { latitude, longitude, accuracy, heading } = position.coords;
            // Cập nhật vị trí
            setCurrentPos({ lat: latitude, lng: longitude, accuracy, heading });
        };

        const error = (err) => {
            console.warn("Lỗi GPS:", err.message);
        };

        // Bắt đầu theo dõi
        watchIdRef.current = navigator.geolocation.watchPosition(success, error, geoOptions);

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

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
                setIsTracking(false); // Dừng bám theo user khi click chọn điểm
            },
        });
        return null;
    };

    // Tính toán tâm khởi tạo (chỉ dùng cho lần render đầu tiên của MapContainer)
    const initialCenter = (currentPos) ? [currentPos.lat, currentPos.lng] : defaultCenter;

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
                    onDragStart={() => setIsTracking(false)} // Người dùng kéo map -> Tắt tracking
                />

                {/* 1. BẾN XE */}
                <Marker position={[stationLocation.lat, stationLocation.lng]} icon={stationIcon}>
                    <Popup><b>🏁 {stationLocation.address}</b></Popup>
                </Marker>

                {/* 2. VỊ TRÍ USER (Realtime) */}
                {currentPos && (
                    <>
                        {/* Vòng tròn sai số */}
                        <Circle 
                            center={[currentPos.lat, currentPos.lng]}
                            radius={currentPos.accuracy} 
                            pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.1, weight: 1, opacity: 0.3 }}
                        />
                        {/* Chấm xanh vị trí */}
                        <Marker 
                            position={[currentPos.lat, currentPos.lng]} 
                            icon={userDotIcon} 
                            zIndexOffset={1000}
                        >
                            <Popup>Bạn đang ở đây</Popup>
                        </Marker>
                    </>
                )}

                {/* 3. ĐIỂM ĐÃ CHỌN */}
                {selectedLocation && selectedLocation.lat && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
                        <Popup>{selectedLocation.address}</Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Nút "Bám theo tôi" - Chỉ hiện khi đang KHÔNG tracking */}
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