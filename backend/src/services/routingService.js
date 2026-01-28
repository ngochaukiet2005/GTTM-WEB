const axios = require('axios');
const ShuttleRequest = require('../models/shuttleRequest.model');
const Trip = require('../models/trip.model');
const Driver = require('../models/driver.model');
const FirebaseService = require('./socketService');
const env = require('../configs/env');

const API_KEY = env.googleMapsApiKey;
const STATION_LOCATION = { lat: 10.7423, lng: 106.6138 }; // Default station


const RoutingService = {
  // Geocode address to lat/lng
  geocode: async (address) => {
    if (typeof address === 'object' && address.lat && address.lng) return address;

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
      const response = await axios.get(url);
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].geometry.location;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  // CN-HT-01: Thuật toán phân xe và tối ưu lộ trình
  optimizeTrip: async (origin, destinations) => {
    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Google Maps API Key is missing. Returning non-optimized order.');
      return {
        routes: [{
          optimizedIntermediateWaypointIndex: destinations.map((_, i) => i)
        }]
      };
    }

    try {
      const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
      const body = {
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: origin } },
        intermediates: destinations.map(d => ({
          location: { latLng: { lat: d.lat, lng: d.lng } }
        })),
        travelMode: 'DRIVE',
        optimizeWaypointOrder: true,
      };

      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.legs'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Routing optimization error:', error.response?.data || error.message);
      return {
        routes: [{
          optimizedIntermediateWaypointIndex: destinations.map((_, i) => i)
        }]
      };
    }
  },

  // Dispatch Engine: Tự động gom chuyến và phân xe
  processDispatch: async (timeSlot, cutoffMinutes = 30) => {
    try {
      const startTime = new Date(timeSlot);
      const requests = await ShuttleRequest.find({
        timeSlot: startTime,
        status: 'waiting'
      }).populate('passengerId');

      if (requests.length === 0) return { message: "No pending requests for this timeslot" };

      const availableDrivers = await Driver.find({ status: 'active' });
      if (availableDrivers.length === 0) return { message: "No active drivers available" };

      const tripsCreated = [];
      let currentRequestIndex = 0;

      for (const driver of availableDrivers) {
        if (currentRequestIndex >= requests.length) break;

        const capacity = driver.capacity || 16;
        // 🔥 Mỗi hành khách cần 1 chỗ ngồi, KHÔNG phải 2 điểm dừng
        // Vì xe chở hành khách, không phải đếm số điểm dừng
        const maxPassengers = capacity;
        const batchRequests = requests.slice(currentRequestIndex, currentRequestIndex + maxPassengers);
        currentRequestIndex += maxPassengers;

        // 🔥 Tạo CẢ 2 điểm (pickup + dropoff) cho mỗi request
        const allWaypoints = [];
        for (const req of batchRequests) {
          // Điểm đón
          const pickupAddr = req.direction === "HOME_TO_STATION" ? req.pickupLocation : req.dropoffLocation;
          const pickupCoords = await RoutingService.geocode(pickupAddr) || { lat: 10.7, lng: 106.6 };
          allWaypoints.push({
            ...pickupCoords,
            requestId: req._id,
            address: pickupAddr,
            type: 'pickup'
          });

          // Điểm trả
          const dropoffAddr = req.direction === "HOME_TO_STATION" ? req.dropoffLocation : req.pickupLocation;
          const dropoffCoords = await RoutingService.geocode(dropoffAddr) || { lat: 10.7, lng: 106.6 };
          allWaypoints.push({
            ...dropoffCoords,
            requestId: req._id,
            address: dropoffAddr,
            type: 'dropoff'
          });
        }

        const optimizedData = await RoutingService.optimizeTrip(STATION_LOCATION, allWaypoints);
        const orderIndices = optimizedData.routes[0].optimizedIntermediateWaypointIndex ||
          allWaypoints.map((_, i) => i);

        const route = orderIndices.map((originalIndex, order) => {
          const waypoint = allWaypoints[originalIndex];
          return {
            requestId: waypoint.requestId,
            location: waypoint.address,
            type: waypoint.type,
            order: order + 1,
            status: 'pending'
          };
        });

        const newTrip = await Trip.create({
          vehicleId: driver.vehicleId,
          driverId: driver._id,
          timeSlot: startTime,
          route,
          status: 'ready'
        });

        await ShuttleRequest.updateMany(
          { _id: { $in: batchRequests.map(r => r._id) } },
          { status: 'assigned', tripId: newTrip._id }
        );

        await Driver.findByIdAndUpdate(driver._id, { status: 'on_trip' });

        // Notify driver via Socket
        FirebaseService.notifyDriver(driver.userId.toString(), "NEW_TRIP", {
          tripId: newTrip._id,
          message: "Bạn có chuyến xe mới từ Dispatch Engine!",
          tripInfo: {
            time: startTime,
            stops: route.length
          }
        });

        tripsCreated.push(newTrip);
      }

      return {
        count: tripsCreated.length,
        trips: tripsCreated
      };
    } catch (error) {
      console.error('processDispatch error:', error);
      throw error;
    }
  }
};

module.exports = RoutingService;
