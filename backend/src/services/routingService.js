const axios = require('axios');

const RoutingService = {
  // CN-HT-01: Thuật toán phân xe và tối ưu lộ trình [cite: 60]
  optimizeTrip: async (origin, destinations) => {
    // origin: {lat, lng} - Địa chỉ bến xe [cite: 61]
    // destinations: [{lat, lng}, ...] - Danh sách khách hàng [cite: 61]
    
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const body = {
      origin: { location: { latLng: origin } },
      destination: { location: { latLng: origin } }, // Quay lại bến hoặc điểm cuối
      intermediates: destinations.map(d => ({ location: { latLng: d } })),
      travelMode: 'DRIVE',
      optimizeWaypointOrder: true, // Giải quyết TSP 
    };

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': 'YOUR_GOOGLE_MAPS_API_KEY',
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.legs'
      }
    });

    return response.data; // Trả về mảng điểm dừng đã sắp xếp 
  }
};