// frontend/src/core/apiClient.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem("authTokens");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeTokens = (payload) => {
  localStorage.setItem("authTokens", JSON.stringify(payload));
};

export const clearTokens = () => {
  localStorage.removeItem("authTokens");
};

const buildHeaders = (token, extra = {}) => {
  const finalToken = token || getStoredTokens()?.accessToken;
  
  // Debug log (có thể xóa khi production)
  // if (!finalToken) console.warn("⚠️ Warning: Requesting without Access Token");

  return {
    "Content-Type": "application/json",
    ...(finalToken ? { Authorization: `Bearer ${finalToken}` } : {}),
    ...extra,
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || data?.error || `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status; // Quan trọng để bắt lỗi 401
    throw error;
  }
  return data;
};

const request = async (path, options = {}) => {
  const { method = "GET", body, token, headers: extraHeaders, ...rest } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    method,
    headers: buildHeaders(token, extraHeaders),
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  return handleResponse(res);
};

export const apiClient = {
  // ... (Giữ nguyên các hàm Auth, Passenger, Driver như bạn đã viết)
  // Bạn không cần thay đổi phần body của object apiClient
  // Chỉ cần đảm bảo phần helper functions ở trên giống như này là được.
  login: async ({ identifier, password }) =>
    request("/auth/login", {
      method: "POST",
      body: { email: identifier, password },
    }),
  // ... copy lại các hàm khác từ file cũ của bạn
  register: async (data) => request("/auth/register", { method: "POST", body: data }),
  verifyEmail: async ({ email, otp }) => request("/auth/verify-email", { method: "POST", body: { email, otp } }),
  resendOtp: async ({ email, purpose = "VERIFY" }) => request("/auth/resend-otp", { method: "POST", body: { email, purpose } }),
  refreshToken: async (refreshToken) => request("/auth/refresh", { method: "POST", body: { refreshToken } }),
  logout: async () => request("/auth/logout", { method: "POST" }),
  changePassword: async ({ oldPassword, newPassword }) => request("/auth/change-password", { method: "POST", body: { oldPassword, newPassword } }),
  forgotPassword: async ({ email }) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: async ({ email, otp, newPassword }) => request("/auth/reset-password", { method: "POST", body: { email, otp, newPassword } }),
  
  getProfile: async () => request("/passenger/profile"),
  updateProfile: async ({ name, phone }) => request("/passenger/profile", { method: "PATCH", body: { name, phone } }),
  verifyTicket: async ({ ticketCode }) => request("/passenger/verify-ticket", { method: "POST", body: { ticketCode } }),
  
  createShuttleRequest: async (data) => request("/tickets/request", { method: "POST", body: data }),
  getShuttleStatus: async () => request("/tickets/status"),
  cancelRequest: async (id) => request(`/tickets/${id}/cancel`, { method: "PATCH" }),
  
  createTrip: async (data) => request("/trips", { method: "POST", body: data }),
  getPassengerTrips: async () => request("/trips"),
  getTripById: async (tripId) => request(`/trips/${tripId}`),
  
  getDriverTrips: async () => request("/driver/trips"),
  getDriverTripById: async (tripId) => request(`/driver/trips/${tripId}`),
  updateStopStatus: async ({ tripId, requestId, status }) => request(`/driver/trips/${tripId}/stop/${requestId}`, { method: "PATCH", body: { status } }),
  
  getAllDrivers: async () => request("/driver/admin/all"),
  createDriver: async (driverData) => request("/driver/admin/create", { method: "POST", body: driverData }),
  toggleDriverStatus: async (id) => request(`/driver/admin/${id}/toggle`, { method: "PATCH" }),
  deleteDriver: async (id) => request(`/driver/admin/${id}`, { method: "DELETE" }),
  
  getTimeSlots: async () => request("/timeslots"),
};