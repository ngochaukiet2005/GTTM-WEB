// src/features/passenger/TripHistory.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { apiClient, getStoredTokens } from "../../core/apiClient";

const TripHistory = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [cancelModal, setCancelModal] = useState({ show: false, tripId: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.getShuttleStatus(tokens.accessToken);
        setTrips(res.data?.history || []);
      } catch (error) {
        if (error?.message?.includes("401")) {
          Swal.fire({
            icon: "warning",
            title: "Phiên hết hạn",
            text: "Vui lòng đăng nhập lại.",
          });
          localStorage.removeItem("currentUser");
          navigate("/passenger/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
    const intervalId = setInterval(fetchTrips, 5000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const activeTrips = trips.filter((t) =>
    ["waiting", "assigned", "running"].includes(t.status),
  );
  const pastTrips = trips.filter(
    (t) => !["waiting", "assigned", "running"].includes(t.status),
  );

  const handleRebook = (trip) => {
    navigate("/passenger/booking", {
      state: {
        pickup: { address: trip.pickupLocation },
        destination: { address: trip.dropoffLocation },
      },
    });
  };

  const onRequestCancel = (tripId) => {
    setCancelModal({ show: true, tripId });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.tripId) return;
    try {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng đăng nhập",
          text: "Bạn cần đăng nhập để hủy chuyến.",
        });
        setCancelModal({ show: false, tripId: null });
        return;
      }
      await apiClient.cancelRequest({
        id: cancelModal.tripId,
        token: tokens.accessToken,
      });
      setCancelModal({ show: false, tripId: null });
      const res = await apiClient.getShuttleStatus(tokens.accessToken);
      setTrips(res.data?.history || []);
    } catch (error) {
      setCancelModal({ show: false, tripId: null });
      Swal.fire({
        icon: "error",
        title: "Hủy chuyến thất bại",
        text: error.message,
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "waiting":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse">
            ⏳ Đang tìm xe
          </span>
        );
      case "assigned":
        return (
          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            🚕 Đã điều xe
          </span>
        );
      case "running":
        return (
          <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            🚀 Đang chạy
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            ✔ Hoàn thành
          </span>
        );
      case "no_show":
        return (
          <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            ✕ Không đón được
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            ✕ Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-24 font-sans text-slate-800">
      <h1 className="text-2xl font-bold mb-6 px-4 md:px-0 pt-6">
        Quản lý chuyến đi
      </h1>

      {/* TABS */}
      <div className="flex p-1 bg-gray-100 rounded-xl mx-4 md:mx-0 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "active" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Đang hoạt động ({activeTrips.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Lịch sử ({pastTrips.length})
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4 px-4 md:px-0">
        {(activeTab === "active" ? activeTrips : pastTrips).map((trip) => (
          <div
            key={trip.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
          >
            {/* Header: Đã xóa giá */}
            <div className="flex justify-between items-start mb-4">
              <div>
                {getStatusBadge(trip.status)}
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {trip.timeSlot
                    ? new Date(trip.timeSlot).toLocaleString("vi-VN")
                    : ""}
                </p>
              </div>
              {/* Đã xóa <p> giá tiền ở đây */}
            </div>

            {/* Route */}
            <div className="space-y-4 mb-4 relative pl-2">
              <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-200 border-dashed z-0"></div>
              <div className="relative z-10 flex gap-3 items-start">
                <div className="mt-1 w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white shadow-sm shrink-0"></div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {trip.pickupLocation}
                </p>
              </div>
              <div className="relative z-10 flex gap-3 items-start">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shrink-0"></div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {trip.dropoffLocation}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-20">
              {/* --- TAB ACTIVE --- */}
              {activeTab === "active" && (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl border border-gray-100">
                      {trip.driver ? "🤠" : "📡"}
                    </div>
                    <div>
                      {trip.driver ? (
                        <>
                          <p className="font-bold text-sm text-gray-800">
                            {trip.driver.name}
                          </p>
                          <p className="text-xs bg-gray-100 inline-block px-1 rounded text-gray-600 font-mono mt-0.5">
                            {trip.driver.plate}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold text-sm text-gray-500 italic">
                          Đang tìm tài xế...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* LOGIC HỦY */}
                  {trip.status === "waiting" ? (
                    <button
                      onClick={() => onRequestCancel(trip.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Hủy tìm
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 italic">
                      Không thể hủy
                    </span>
                  )}
                </div>
              )}

              {/* --- TAB HISTORY --- */}
              {activeTab === "history" && (
                <div className="flex gap-3 w-full justify-end items-center relative z-30">
                  <button
                    onClick={() => handleRebook(trip)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer relative z-40"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Đặt lại
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {!loading &&
          (activeTab === "active" ? activeTrips : pastTrips).length === 0 && (
            <div className="text-center py-12 text-gray-400 opacity-60">
              <p>Không có chuyến nào.</p>
            </div>
          )}
      </div>

      {/* --- MODAL 1: XÁC NHẬN HỦY --- */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-xs shadow-2xl animate-scale-up text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Hủy tìm tài xế?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn hủy chuyến đi này không?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ show: false, tripId: null })}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Không
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                Hủy chuyến
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;
