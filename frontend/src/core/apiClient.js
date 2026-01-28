// Lightweight fetch-based API client
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Automatically retrieves tokens from localStorage
 */
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

/**
 * Builds headers with optional token. 
 * If no token is provided, it tries to get it from storage.
 */
const buildHeaders = (token, extra = {}) => {
  const finalToken = token || getStoredTokens()?.accessToken;
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
    error.status = res.status;
    throw error;
  }
  return data;
};

/**
 * Generic request helper
 */
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
  // --- AUTH ---
  login: async ({ identifier, password }) =>
    request("/auth/login", {
      method: "POST",
      body: { email: identifier, password },
    }),

  register: async (data) =>
    request("/auth/register", {
      method: "POST",
      body: data,
    }),

  verifyEmail: async ({ email, otp }) =>
    request("/auth/verify-email", {
      method: "POST",
      body: { email, otp },
    }),

  resendOtp: async ({ email, purpose = "VERIFY" }) =>
    request("/auth/resend-otp", {
      method: "POST",
      body: { email, purpose },
    }),

  refreshToken: async (refreshToken) =>
    request("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    }),

  logout: async () =>
    request("/auth/logout", { method: "POST" }),

  changePassword: async ({ oldPassword, newPassword }) =>
    request("/auth/change-password", {
      method: "POST",
      body: { oldPassword, newPassword },
    }),

  forgotPassword: async ({ email }) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: async ({ email, otp, newPassword }) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { email, otp, newPassword },
    }),

  // --- PASSENGER ---
  getProfile: async () => request("/passenger/profile"),

  updateProfile: async ({ name, phone }) =>
    request("/passenger/profile", {
      method: "PATCH",
      body: { name, phone },
    }),

  verifyTicket: async ({ ticketCode }) =>
    request("/passenger/verify-ticket", {
      method: "POST",
      body: { ticketCode },
    }),

  // --- SHUTTLE REQUESTS ---
  createShuttleRequest: async (data) =>
    request("/shuttle-request/request", {
      method: "POST",
      body: data,
    }),

  getShuttleStatus: async () => request("/shuttle-request/status"),

  cancelRequest: async (id) =>
    request(`/shuttle-request/${id}/cancel`, { method: "PATCH" }),

  // --- TRIPS ---
  createTrip: async (data) =>
    request("/trips", {
      method: "POST",
      body: data,
    }),

  getPassengerTrips: async () => request("/trips"),

  getTripById: async (tripId) => request(`/trips/${tripId}`),

  // --- DRIVER ---
  getDriverTrips: async () => request("/driver/trips"),

  getDriverTripById: async (tripId) => request(`/driver/trips/${tripId}`),

  updateStopStatus: async ({ tripId, requestId, status }) =>
    request(`/driver/trips/${tripId}/stop/${requestId}`, {
      method: "PATCH",
      body: { status },
    }),

  // --- TIMESLOTS (MỚI) ---
  getTimeSlots: async () => request("/timeslots"),
};