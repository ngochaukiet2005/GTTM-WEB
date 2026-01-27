// src/features/passenger/PassengerBooking.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppMap from "../map/AppMap";
import { apiClient, getStoredTokens } from "../../core/apiClient";
// 👇 IMPORT THƯ VIỆN THÔNG BÁO "XỊN"
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

const FIXED_SLOTS = [
  2 - 3,
  4 - 5,
  6 - 7,
  8 - 9,
  10 - 11,
  12 - 13,
  14 - 15,
  16 - 17,
  18 - 19,
  20 - 21,
  22 - 23,
];

const PassengerBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isGoingToStation, setIsGoingToStation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [locating, setLocating] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Không cần state showSuccessModal nữa vì dùng SweetAlert2

  const [ticketForm, setTicketForm] = useState({
    tripCode: "",
    fullName: "",
    email: "",
    phone: "",
    tripDate: "",
    departTime: "",
    pickup: BUS_STATIONS[0],
    destination: BUS_STATIONS[1],
  });

  const [bookingTime, setBookingTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  const getAddressFromNominatim = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name
        ? data.display_name.split(",").slice(0, 3).join(",")
        : "Vị trí đã chọn";
    } catch (error) {
      console.error("Lỗi:", error);
      return "Lỗi bản đồ";
    }
  };

  useEffect(() => {
    if (location.state) {
      const { pickup, destination } = location.state;
      const isFromStation = pickup.address.includes("Bến xe Miền Tây");

      if (isFromStation) {
        setIsGoingToStation(false);
        setSelectedPoint(destination);
      } else {
        setIsGoingToStation(true);
        setSelectedPoint(pickup);
      }
    } else {
      handleGetLocation();
    }
  }, [location]);

  useEffect(() => {
    if (isVerified) {
      calculateAvailableSlots();
    }
  }, [isVerified]);

  const calculateAvailableSlots = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (!ticketForm.departTime) return;

    const busDepartHour = parseInt(ticketForm.departTime.split(":")[0]);
    const tripDate = new Date(ticketForm.tripDate);

    // Reset giờ để so sánh ngày chính xác
    const cleanNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cleanTripDate = new Date(
      tripDate.getFullYear(),
      tripDate.getMonth(),
      tripDate.getDate(),
    );

    const isToday = cleanTripDate.getTime() === cleanNow.getTime();

    const validSlots = FIXED_SLOTS.filter((slot) => {
      // 1. Slot phải trước giờ xe chạy ít nhất 1 tiếng (logic thực tế)
      if (slot >= busDepartHour) return false;
      // 2. Nếu là hôm nay, Slot phải sau giờ hiện tại
      if (isToday && slot <= currentHour) return false;
      return true;
    });

    setAvailableSlots(validSlots);
    if (validSlots.length > 0) {
      setBookingTime(validSlots[0] + ":00");
    } else {
      setBookingTime("");
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
        setSelectedPoint({ lat, lng, address: addressName });
        setLocating(false);
      },
      (error) => {
        console.error("Lỗi GPS:", error);
        setLocating(false);
      },
    );
  };

  const handleMapClick = async ({ lat, lng }) => {
    setSelectedPoint({ lat, lng, address: "Đang lấy địa chỉ..." });
    const addressName = await getAddressFromNominatim(lat, lng);
    setSelectedPoint({ lat, lng, address: addressName });
  };

  const pickup = isGoingToStation ? selectedPoint : BEN_XE_MIEN_TAY;
  const destination = isGoingToStation ? BEN_XE_MIEN_TAY : selectedPoint;

  // 👇 XỬ LÝ: Xác thực vé với SweetAlert2
  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const now = new Date();
      // Ghép chuỗi ngày giờ để so sánh chính xác
      const tripDateTime = new Date(
        `${ticketForm.tripDate}T${ticketForm.departTime}`,
      );

      // Logic check ngày quá hạn
      if (tripDateTime < now) {
        throw new Error("Vé này đã quá hạn hoặc xe đã khởi hành!");
      }

      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng đăng nhập",
          text: "Bạn cần đăng nhập để xác thực vé.",
        });
        setVerifying(false);
        return;
      }

      await apiClient.verifyTicket({
        ticketCode: ticketForm.tripCode,
        token: tokens.accessToken,
      });

      // 👇 THÔNG BÁO XỊN: Toast góc phải
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: "success",
        title: "Xác thực vé thành công!",
      });

      setIsVerified(true);
    } catch (error) {
      // 👇 THÔNG BÁO XỊN: Popup lỗi
      Swal.fire({
        icon: "error",
        title: "Xác thực thất bại",
        text: error.message,
        confirmButtonText: "Thử lại",
        confirmButtonColor: "#d33",
      });
    } finally {
      setVerifying(false);
    }
  };

  // 👇 XỬ LÝ: Đặt xe với SweetAlert2
  const handleBooking = async () => {
    if (!selectedPoint || !bookingTime) return;
    setIsBooking(true);
    try {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng đăng nhập",
          text: "Bạn cần đăng nhập trước khi đặt chuyến.",
        });
        setIsBooking(false);
        return;
      }

      const timeSlot =
        ticketForm.tripDate && bookingTime
          ? `${ticketForm.tripDate}T${bookingTime}`
          : new Date().toISOString();

      await apiClient.createShuttleRequest({
        ticketCode: ticketForm.tripCode || "DEMO-001", // TODO: yêu cầu nhập mã vé thật
        pickupLocation: pickup?.address || "",
        dropoffLocation: destination?.address || "",
        direction: isGoingToStation ? "HOME_TO_STATION" : "STATION_TO_HOME",
        timeSlot,
        token: tokens.accessToken,
      });

      Swal.fire({
        title: "Đặt xe thành công!",
        html: `
          <div class="text-left text-sm text-gray-600 space-y-2">
            <p><b>Giờ đón:</b> ${bookingTime} - Ngày ${ticketForm.tripDate || "Hôm nay"}</p>
            <p><b>Điểm đón:</b> ${pickup?.address || "N/A"}</p>
            <p><b>Tài xế:</b> Đang điều phối...</p>
            <p class="text-green-600 font-bold mt-2">✨ Đã gửi yêu cầu tới hệ thống!</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Xem Lịch Sử Chuyến Đi",
        confirmButtonColor: "#2563eb",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/passenger/history");
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi đặt xe",
        text: error.message,
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans bg-gray-50">
      <div className="absolute inset-0 z-0">
        <AppMap
          userLocation={null}
          stationLocation={BEN_XE_MIEN_TAY}
          selectedLocation={selectedPoint}
          isGoingToStation={isGoingToStation}
          onLocationSelect={handleMapClick}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none md:hidden" />
      </div>

      {/* FORM XÁC THỰC (Giữ nguyên layout, chỉ logic thông báo đã đổi) */}
      {!isVerified && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-down max-h-[95vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                Xác Thực Vé Nhà Xe
              </h2>
              <p className="text-sm text-gray-500">
                Vui lòng điền đầy đủ thông tin vé để được xác nhận.
              </p>
            </div>

            <form onSubmit={handleVerifyTicket} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Mã chuyến (*)
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="VX001"
                    className="w-full p-2 border rounded-lg uppercase"
                    value={ticketForm.tripCode}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, tripCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Email đặt vé (*)
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="khach@gmail.com"
                    className="w-full p-2 border rounded-lg"
                    value={ticketForm.email}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Họ và tên
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={ticketForm.fullName}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, fullName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Số điện thoại (*)
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full p-2 border rounded-lg"
                    placeholder="090..."
                    value={ticketForm.phone}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Ngày khởi hành (*)
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={ticketForm.tripDate}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, tripDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Giờ xe chạy (*)
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full p-2 border rounded-lg"
                    value={ticketForm.departTime}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        departTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Điểm đón (Vé)
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    value={ticketForm.pickup}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, pickup: e.target.value })
                    }
                  >
                    {BUS_STATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Điểm đến (Vé)
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    value={ticketForm.destination}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        destination: e.target.value,
                      })
                    }
                  >
                    {BUS_STATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all mt-4"
              >
                {verifying ? "Đang kiểm tra..." : "Xác thực ngay"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PANEL ĐẶT XE (Giữ nguyên) */}
      {isVerified && (
        <>
          <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 z-20">
            <button
              onClick={handleGetLocation}
              className="bg-white p-4 rounded-full shadow-xl text-gray-600 hover:text-blue-600"
            >
              <svg
                className={`h-6 w-6 ${locating ? "animate-spin text-blue-600" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          <div className="absolute top-4 left-4 right-4 md:left-12 md:top-12 md:w-[420px] z-10">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20 animate-fade-in-down">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-extrabold text-gray-800">
                  GTTM <span className="text-blue-600">Shuttle</span>
                </h1>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    Miễn phí
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">
                    {isGoingToStation ? "Đến Bến" : "Rời Bến"}
                  </span>
                </div>
              </div>

              <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner mb-6">
                <div className="absolute left-[29px] top-[34px] bottom-[34px] w-[2px] border-l-2 border-dashed border-gray-300 z-0 pointer-events-none"></div>
                <div
                  className={`relative z-10 flex items-center gap-4 mb-4 ${!pickup ? "opacity-50" : "opacity-100"}`}
                >
                  <div className="w-4 h-4 rounded-full border-[3px] border-blue-500 bg-white shadow-sm flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                      Điểm đón
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {pickup ? pickup.address : "..."}
                    </p>
                  </div>
                </div>
                <div
                  className={`relative z-10 flex items-center gap-4 ${!destination ? "opacity-50" : "opacity-100"}`}
                >
                  <div className="w-4 h-4 flex-shrink-0 text-red-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                      Điểm trả
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {destination ? destination.address : "..."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGoingToStation(!isGoingToStation)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Khung giờ shuttle bus
                  </label>

                  {availableSlots.length > 0 ? (
                    <select
                      value={bookingTime.split(":")[0]}
                      onChange={(e) => setBookingTime(e.target.value + ":00")}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}:00
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold text-center">
                      Không còn chuyến xe nào khả dụng trước giờ xe chạy (
                      {ticketForm.departTime})
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBooking}
                  disabled={
                    !selectedPoint || isBooking || availableSlots.length === 0
                  }
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 ${!selectedPoint || isBooking || availableSlots.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:-translate-y-1"}`}
                >
                  {isBooking ? "Đang xử lý..." : "Xác nhận đặt xe"}
                </button>

                {!selectedPoint && (
                  <p className="mt-4 text-center text-xs font-medium text-gray-400 animate-pulse">
                    👇 Chọn điểm {isGoingToStation ? "đón" : "trả"} trên bản đồ
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PassengerBooking;
