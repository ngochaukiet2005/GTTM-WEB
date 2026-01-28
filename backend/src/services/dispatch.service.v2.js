// ========================================
// DISPATCH SERVICE V2 - VIẾT LẠI HOÀN TOÀN
// ========================================
// Mục tiêu:
// 1. Kiểm tra capacity chặt chẽ
// 2. Tạo đúng số điểm dừng (pickup + dropoff)
// 3. Phân phối đều cho nhiều tài xế
// 4. Cập nhật trạng thái chính xác
// ========================================

const Trip = require('../models/trip.model');
const Driver = require('../models/driver.model');
const ShuttleRequest = require('../models/shuttleRequest.model');
const SocketService = require('./socketService');
const axios = require('axios');

const STATION_LOCATION = { lat: 10.742336, lng: 106.613876 }; // Bến xe Miền Tây
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

class DispatchServiceV2 {

    // ==========================================
    // 1. GEOCODING - Chuyển địa chỉ thành tọa độ
    // ==========================================
    async geocode(address) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await axios.get(url);

            if (response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                return { lat: location.lat, lng: location.lng };
            }
        } catch (error) {
            console.error('❌ Geocoding error:', error.message);
        }

        // Fallback: Trả về tọa độ mặc định (trung tâm TP.HCM)
        return { lat: 10.75, lng: 106.65 };
    }

    // ==========================================
    // 2. TỐI ƯU LỘ TRÌNH - Google Routes API
    // ==========================================
    async optimizeRoute(origin, waypoints) {
        if (!GOOGLE_MAPS_API_KEY || waypoints.length === 0) {
            // Không có API key hoặc không có điểm dừng → Trả về thứ tự gốc
            return waypoints.map((_, idx) => idx);
        }

        try {
            const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

            const body = {
                origin: { location: { latLng: origin } },
                destination: { location: { latLng: origin } }, // Quay về bến xe
                intermediates: waypoints.map(wp => ({
                    location: { latLng: { latitude: wp.lat, longitude: wp.lng } }
                })),
                travelMode: 'DRIVE',
                optimizeWaypointOrder: true
            };

            const response = await axios.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex'
                }
            });

            if (response.data.routes && response.data.routes[0]) {
                return response.data.routes[0].optimizedIntermediateWaypointIndex || waypoints.map((_, idx) => idx);
            }
        } catch (error) {
            console.error('❌ Route optimization error:', error.response?.data || error.message);
        }

        // Fallback: Trả về thứ tự gốc
        return waypoints.map((_, idx) => idx);
    }

    // ==========================================
    // 3. TẠO WAYPOINTS - Mỗi request tạo 2 điểm
    // ==========================================
    async createWaypoints(requests) {
        const waypoints = [];

        for (const req of requests) {
            // Xác định địa chỉ đón và trả dựa vào direction
            let pickupAddr, dropoffAddr;

            if (req.direction === 'HOME_TO_STATION') {
                pickupAddr = req.pickupLocation;   // Đón ở nhà
                dropoffAddr = req.dropoffLocation; // Trả ở bến xe
            } else {
                pickupAddr = req.dropoffLocation;  // Đón ở bến xe
                dropoffAddr = req.pickupLocation;  // Trả ở nhà
            }

            // Geocode điểm đón
            const pickupCoords = await this.geocode(pickupAddr);
            waypoints.push({
                requestId: req._id,
                passengerId: req.passengerId,
                address: pickupAddr,
                lat: pickupCoords.lat,
                lng: pickupCoords.lng,
                type: 'pickup'
            });

            // Geocode điểm trả
            const dropoffCoords = await this.geocode(dropoffAddr);
            waypoints.push({
                requestId: req._id,
                passengerId: req.passengerId,
                address: dropoffAddr,
                lat: dropoffCoords.lat,
                lng: dropoffCoords.lng,
                type: 'dropoff'
            });
        }

        return waypoints;
    }

    // ==========================================
    // 4. PHÂN CHIA REQUESTS THEO CAPACITY
    // ==========================================
    groupRequestsByCapacity(requests, drivers) {
        const groups = [];
        let currentIndex = 0;

        for (const driver of drivers) {
            if (currentIndex >= requests.length) break;

            const capacity = driver.capacity || 16;

            // 🔥 QUAN TRỌNG: Mỗi hành khách chiếm 1 chỗ ngồi
            // Không phải 2 chỗ (vì pickup và dropoff là cùng 1 người)
            const maxPassengers = capacity;

            const batch = requests.slice(currentIndex, currentIndex + maxPassengers);
            currentIndex += maxPassengers;

            if (batch.length > 0) {
                groups.push({
                    driver,
                    requests: batch,
                    passengerCount: batch.length
                });
            }
        }

        // Nếu còn requests mà hết driver → Cảnh báo
        if (currentIndex < requests.length) {
            console.warn(`⚠️  Còn ${requests.length - currentIndex} requests chưa được phân công (thiếu tài xế)`);
        }

        return groups;
    }

    // ==========================================
    // 5. TẠO TRIP CHO MỘT DRIVER
    // ==========================================
    async createTripForDriver(driver, requests, timeSlot) {
        console.log(`\n🚗 Tạo trip cho tài xế: ${driver.name} (${driver.vehicleId})`);
        console.log(`   Capacity: ${driver.capacity} chỗ`);
        console.log(`   Số hành khách: ${requests.length} người`);

        // Kiểm tra capacity
        if (requests.length > driver.capacity) {
            throw new Error(`Vượt quá capacity! ${requests.length} > ${driver.capacity}`);
        }

        // Tạo waypoints (mỗi request → 2 waypoints)
        const waypoints = await this.createWaypoints(requests);
        console.log(`   Số điểm dừng: ${waypoints.length} điểm (${requests.length} đón + ${requests.length} trả)`);

        // Tối ưu thứ tự
        const optimizedIndices = await this.optimizeRoute(STATION_LOCATION, waypoints);

        // Tạo route theo thứ tự tối ưu
        const route = optimizedIndices.map((originalIdx, order) => {
            const wp = waypoints[originalIdx];
            return {
                requestId: wp.requestId,
                location: wp.address,
                lat: wp.lat,
                lng: wp.lng,
                type: wp.type,
                order: order + 1,
                status: 'pending'
            };
        });

        // Tạo Trip
        const trip = await Trip.create({
            vehicleId: driver.vehicleId,
            driverId: driver._id,
            timeSlot: new Date(timeSlot),
            route,
            status: 'ready'
        });

        // Cập nhật status của requests
        await ShuttleRequest.updateMany(
            { _id: { $in: requests.map(r => r._id) } },
            { status: 'assigned', tripId: trip._id }
        );

        // Cập nhật status driver
        await Driver.findByIdAndUpdate(driver._id, { status: 'busy' });

        // Gửi thông báo cho tài xế qua Socket
        try {
            SocketService.notifyDriver(driver.userId.toString(), 'NEW_TRIP', {
                tripId: trip._id,
                message: `Bạn có chuyến xe mới lúc ${new Date(timeSlot).toLocaleTimeString('vi-VN')}`,
                passengerCount: requests.length,
                stopCount: route.length
            });
        } catch (socketError) {
            console.error('❌ Socket notification error:', socketError.message);
        }

        console.log(`   ✅ Trip created: ${trip._id}`);
        return trip;
    }

    // ==========================================
    // 6. AUTO DISPATCH - HÀM CHÍNH
    // ==========================================
    async autoDispatch(timeSlot) {
        try {
            console.log('\n' + '='.repeat(80));
            console.log('🚀 BẮT ĐẦU AUTO DISPATCH');
            console.log('='.repeat(80));
            console.log(`⏰ Time slot: ${new Date(timeSlot).toLocaleString('vi-VN')}`);

            // 1. Lấy danh sách requests đang chờ
            const requests = await ShuttleRequest.find({
                timeSlot: new Date(timeSlot),
                status: 'waiting'
            }).populate('passengerId', 'name phone');

            console.log(`📦 Tìm thấy ${requests.length} requests đang chờ`);

            if (requests.length === 0) {
                console.log('ℹ️  Không có request nào cần xử lý');
                return { success: true, message: 'No pending requests', trips: [] };
            }

            // 2. Lấy danh sách tài xế available
            const drivers = await Driver.find({ status: 'active' }).populate('userId', '_id');

            console.log(`👥 Tìm thấy ${drivers.length} tài xế sẵn sàng`);

            if (drivers.length === 0) {
                console.log('❌ Không có tài xế nào sẵn sàng');
                return { success: false, message: 'No available drivers', trips: [] };
            }

            // 3. Phân chia requests theo capacity
            const groups = this.groupRequestsByCapacity(requests, drivers);
            console.log(`📊 Đã phân chia thành ${groups.length} nhóm`);

            // 4. Tạo trip cho từng nhóm
            const trips = [];
            for (const group of groups) {
                try {
                    const trip = await this.createTripForDriver(group.driver, group.requests, timeSlot);
                    trips.push(trip);
                } catch (error) {
                    console.error(`❌ Lỗi tạo trip cho ${group.driver.name}:`, error.message);
                }
            }

            console.log('\n' + '='.repeat(80));
            console.log(`✅ HOÀN TẤT: Đã tạo ${trips.length} trips`);
            console.log('='.repeat(80) + '\n');

            return { success: true, trips };

        } catch (error) {
            console.error('❌ AUTO DISPATCH ERROR:', error);
            throw error;
        }
    }
}

module.exports = new DispatchServiceV2();
