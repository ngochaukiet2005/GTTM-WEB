// Lightweight fetch-based API client
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const buildHeaders = (token, extra = {}) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
};

export const apiClient = {
  login: async ({ identifier, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ email: identifier, password }),
    });
    return handleResponse(res);
  },

  register: async ({
    fullName,
    email,
    numberPhone,
    password,
    confirmPassword,
    gender,
  }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        fullName,
        email,
        numberPhone,
        password,
        confirmPassword,
        gender,
      }),
    });
    return handleResponse(res);
  },

  verifyEmail: async ({ email, otp }) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(res);
  },

  resendOtp: async ({ email, purpose = "VERIFY" }) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ email, purpose }),
    });
    return handleResponse(res);
  },

  createShuttleRequest: async ({
    ticketCode,
    pickupLocation,
    dropoffLocation,
    direction,
    timeSlot,
    token,
  }) => {
    const res = await fetch(`${API_BASE}/shuttle-request/request`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({
        ticketCode,
        pickupLocation,
        dropoffLocation,
        direction,
        timeSlot,
      }),
    });
    return handleResponse(res);
  },

  getShuttleStatus: async (token) => {
    const res = await fetch(`${API_BASE}/shuttle-request/status`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  cancelRequest: async ({ id, token }) => {
    const res = await fetch(`${API_BASE}/shuttle-request/${id}/cancel`, {
      method: "PATCH",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  verifyTicket: async ({ ticketCode, token }) => {
    const res = await fetch(`${API_BASE}/passenger/verify-ticket`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ ticketCode }),
    });
    return handleResponse(res);
  },

  getProfile: async (token) => {
    const res = await fetch(`${API_BASE}/passenger/profile`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  updateProfile: async ({ name, phone, token }) => {
    const res = await fetch(`${API_BASE}/passenger/profile`, {
      method: "PATCH",
      headers: buildHeaders(token),
      body: JSON.stringify({ name, phone }),
    });
    return handleResponse(res);
  },

  // Trip endpoints for passengers
  createTrip: async ({
    ticketCode,
    pickupLocation,
    dropoffLocation,
    direction,
    timeSlot,
    token,
  }) => {
    const res = await fetch(`${API_BASE}/trips`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({
        ticketCode,
        pickupLocation,
        dropoffLocation,
        direction,
        timeSlot,
      }),
    });
    return handleResponse(res);
  },

  getPassengerTrips: async (token) => {
    const res = await fetch(`${API_BASE}/trips`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  getTripById: async ({ tripId, token }) => {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  // Driver endpoints
  getDriverTrips: async (token) => {
    const res = await fetch(`${API_BASE}/driver/trips`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  getDriverTripById: async ({ tripId, token }) => {
    const res = await fetch(`${API_BASE}/driver/trips/${tripId}`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  updateStopStatus: async ({ tripId, requestId, status, token }) => {
    const res = await fetch(
      `${API_BASE}/driver/trips/${tripId}/stop/${requestId}`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
        body: JSON.stringify({ status }),
      },
    );
    return handleResponse(res);
  },

  // Authentication additional methods
  refreshToken: async (refreshToken) => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(res);
  },

  logout: async (token) => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },

  changePassword: async ({ oldPassword, newPassword, token }) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleResponse(res);
  },

  forgotPassword: async ({ email }) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return handleResponse(res);
  },
};

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
