const axios = require('axios');

const RoutingService = {
  // 1. Hàm Geocode (Nominatim) - Như đã hướng dẫn ở bước trước
  geocode: async (address) => {
    if (typeof address === 'object' && address.lat && address.lng) return address;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const response = await axios.get(url, { headers: { 'User-Agent': 'GTTM_Web_App' } });
      if (response.data && response.data.length > 0) {
        return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  /**
   * 2. THAY THẾ: optimizeTrip sử dụng OSRM
   * Giải quyết bài toán Traveling Salesman Problem (TSP)
   */
  // backend/src/services/routingService.js

optimizeTrip: async (origin, destinations) => {
  try {
    // Đảm bảo tọa độ là số và không có khoảng trắng
    const originPart = `${origin.lng.toString().trim()},${origin.lat.toString().trim()}`;
    const destPart = destinations
      .map(d => `${d.lng.toString().trim()},${d.lat.toString().trim()}`)
      .join(';');

    const coords = `${originPart};${destPart}`;
    
    // Log ra console để copy chuỗi này dán vào Postman kiểm tra
    console.log("OSRM URL Coords:", coords); 

    const url = `http://router.project-osrm.org/trip/v1/driving/${coords}?source=first&destination=first&roundtrip=true&overview=false`;
    
    // ... gọi axios

    } catch (error) {
      console.error("OSRM Routing Error:", error.message);
      // FALLBACK: Nếu lỗi, trả về thứ tự mặc định của danh sách yêu cầu
      const defaultOrder = destinations.map((_, i) => i);
      return {
        order: defaultOrder,
        waypoints: destinations,
        routes: [{
          optimizedIntermediateWaypointIndex: defaultOrder,
          legs: []
        }]
      };
    }
  }
};

module.exports = RoutingService;