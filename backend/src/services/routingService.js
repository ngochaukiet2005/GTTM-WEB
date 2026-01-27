const axios = require('axios');

const RoutingService = {
  // Tối ưu lộ trình sử dụng Google Directions API
  optimizeTrip: async (origin, destinations) => {
    // origin: {lat, lng} - Điểm bắt đầu
    // destinations: [{lat, lng}, ...] - Danh sách khách hàng
    
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const body = {
      origin: { location: { latLng: origin } },
      destination: { location: { latLng: origin } }, 
      intermediates: destinations.map(d => ({ location: { latLng: d } })),
      travelMode: 'DRIVE',
      optimizeWaypointOrder: true, // Quan trọng: Giải quyết bài toán người giao hàng (TSP)
    };

    try {
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': 'YOUR_GOOGLE_MAPS_API_KEY', // Thay bằng Key thật của bạn
          'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.legs'
        }
      });

      // BỔ SUNG: Trích xuất thứ tự các điểm đã được tối ưu
      const optimizedOrder = response.data.routes[0].optimizedIntermediateWaypointIndex;
      const optimizedDestinations = optimizedOrder.map(index => destinations[index]);

      return {
        order: optimizedOrder,
        waypoints: optimizedDestinations,
        legs: response.data.routes[0].legs
      };
    } catch (error) {
      console.error("Routing Error:", error);
      throw error;
    }
  }
};

module.exports = RoutingService;