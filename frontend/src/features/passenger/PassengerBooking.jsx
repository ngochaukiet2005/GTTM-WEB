// src/features/passenger/PassengerBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppMap from "../map/AppMap";
import { apiClient, getStoredTokens } from "../../core/apiClient";
import Swal from "sweetalert2";

const BEN_XE_MIEN_TAY = {
  lat: 10.742336,
  lng: 106.613876,
  address: "Bến xe Miền Tây (395 Kinh Dương Vương)",
};

const BUS_STATIONS = [
  "Bến xe Miền Tây (TP.HCM)",
  "Bến xe Cần Thơ",
  "Bến xe Vĩnh Long",
  "Trạm dừng chân Cái Bè",
  "Bến xe Mỹ Tho",
];

const DEFAULT_SLOTS = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, "0")}:00 - ${((i + 1) % 24).toString().padStart(2, "0")}:00`,
  _id: `default-${i}`
}));

const PassengerBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isGoingToStation, setIsGoingToStation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    tripCode: "",
    fullName: "",
    email: "",
    phone: "",
    tripDate: "",
    departTime: "",
    pickupLocation: "",
    dropoffLocation: "",
  });

  const [bookingTime, setBookingTime] = useState(DEFAULT_SLOTS[0].time);
  const [allTimeSlots, setAllTimeSlots] = useState(DEFAULT_SLOTS);
  const [availableSlots, setAvailableSlots] = useState(DEFAULT_SLOTS);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await apiClient.getTimeSlots();
        const slotsData = res?.data?.slots || res?.slots || [];
        if (slotsData.length > 0) {
          setAllTimeSlots(slotsData);
          setAvailableSlots(slotsData);
        }
      } catch (error) {
        console.warn("Using default slots");
      }
    };
    fetchSlots();
  }, []);

  useEffect(() => {
    if (location.state) {
      const { pickup, destination } = location.state;
      const isFromStation = pickup.address.includes("Bến xe Miền Tây");
      setIsGoingToStation(!isFromStation);
      setSelectedPoint(isFromStation ? destination : pickup);
      setTicketForm(prev => ({
        ...prev,
        pickupLocation: pickup.address,
        dropoffLocation: destination.address
      }));
    } else {
      handleGetLocation();
    }
  }, [location]);

  const getAddressFromNominatim = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name ? data.display_name.split(",").slice(0, 3).join(",") : "Vị trí đã chọn";
    } catch (error) {
      return "Lỗi bản đồ";
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const addressName = await getAddressFromNominatim(lat, lng);
        const point = { lat, lng, address: addressName };
        setSelectedPoint(point);
        setTicketForm(prev => ({
          ...prev,
          pickupLocation: isGoingToStation ? addressName : BEN_XE_MIEN_TAY.address,
          dropoffLocation: isGoingToStation ? BEN_XE_MIEN_TAY.address : addressName
        }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleMapClick = async ({ lat, lng }) => {
    setSelectedPoint({ lat, lng, address: "Đang lấy địa chỉ..." });
    const addressName = await getAddressFromNominatim(lat, lng);
    setSelectedPoint({ lat, lng, address: addressName });
    setTicketForm(prev => ({
      ...prev,
      pickupLocation: isGoingToStation ? addressName : BEN_XE_MIEN_TAY.address,
      dropoffLocation: isGoingToStation ? BEN_XE_MIEN_TAY.address : addressName
    }));
  };

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await apiClient.verifyTicket({ ticketCode: ticketForm.tripCode });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Xác thực vé thành công!",
        showConfirmButton: false,
        timer: 2000
      });
      setIsVerified(true);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Thất bại", text: error.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingTime) return;
    setIsBooking(true);
    try {
      const requestData = {
        ticketCode: ticketForm.tripCode || "DEMO-001",
        pickupLocation: ticketForm.pickupLocation || (isGoingToStation ? selectedPoint?.address : BEN_XE_MIEN_TAY.address),
        dropoffLocation: ticketForm.dropoffLocation || (isGoingToStation ? BEN_XE_MIEN_TAY.address : selectedPoint?.address),
        direction: isGoingToStation ? "HOME_TO_STATION" : "STATION_TO_HOME",
        timeSlot: bookingTime,
        tripDate: ticketForm.tripDate || new Date().toISOString().split('T')[0]
      };

      await apiClient.createShuttleRequest(requestData);
      Swal.fire({
        title: "Đặt xe thành công!",
        icon: "success",
        confirmButtonText: "Xem Lịch Sử",
        confirmButtonColor: "#2563eb",
      }).then(() => navigate("/passenger/history"));
    } catch (error) {
      Swal.fire({ icon: "error", title: "Lỗi", text: error.message });
    } finally {
      setIsBooking(false);
    }
  };

  const pickup = isGoingToStation ? selectedPoint : BEN_XE_MIEN_TAY;
  const destination = isGoingToStation ? BEN_XE_MIEN_TAY : selectedPoint;

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans bg-gray-50">
      <div className="absolute inset-0 z-0">
        <AppMap stationLocation={BEN_XE_MIEN_TAY} selectedLocation={selectedPoint} isGoingToStation={isGoingToStation} onLocationSelect={handleMapClick} />
      </div>

      {!isVerified && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-blue-700 text-center mb-4">Xác Thực Vé</h2>
            <form onSubmit={handleVerifyTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Mã chuyến (6 số)" className="p-2 border rounded-lg" value={ticketForm.tripCode} onChange={e => setTicketForm({ ...ticketForm, tripCode: e.target.value })} />
                <input required type="email" placeholder="Email" className="p-2 border rounded-lg" value={ticketForm.email} onChange={e => setTicketForm({ ...ticketForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Họ và tên" className="p-2 border rounded-lg" value={ticketForm.fullName} onChange={e => setTicketForm({ ...ticketForm, fullName: e.target.value })} />
                <input required placeholder="Số điện thoại" className="p-2 border rounded-lg" value={ticketForm.phone} onChange={e => setTicketForm({ ...ticketForm, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="p-2 border rounded-lg" value={ticketForm.tripDate} onChange={e => setTicketForm({ ...ticketForm, tripDate: e.target.value })} />
                <input required type="time" className="p-2 border rounded-lg" value={ticketForm.departTime} onChange={e => setTicketForm({ ...ticketForm, departTime: e.target.value })} />
              </div>
              <button type="submit" disabled={verifying} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
                {verifying ? "Đang kiểm tra..." : "Xác thực ngay"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="absolute top-4 left-4 right-4 md:left-12 md:top-12 md:w-[420px] z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            <h1 className="text-xl font-extrabold text-gray-800 mb-4">GTTM <span className="text-blue-600">Shuttle</span></h1>

            <div className="bg-gray-50 rounded-xl p-4 border mb-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <p className="text-sm font-bold truncate">{pickup?.address || "Chọn điểm đón..."}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <p className="text-sm font-bold truncate">{destination?.address || "Chọn điểm trả..."}</p>
              </div>
              <button onClick={() => setIsGoingToStation(!isGoingToStation)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow">🔄</button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Khung giờ trung chuyển</label>
              <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl font-bold">
                {availableSlots.map(slot => (
                  <option key={slot._id} value={slot.time}>{slot.time}</option>
                ))}
              </select>
            </div>

            <button onClick={handleBooking} disabled={isBooking || !selectedPoint} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
              {isBooking ? "Đang xử lý..." : "Xác nhận đặt xe"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerBooking;