import axios from "axios";

// Determine API base URL:
// 1. If VITE_API_URL is set in environment (e.g. Vercel environment variables), use it.
// 2. In local development or unified full-stack server, default to "/api".
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("joy_hub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle 401s
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected server error occurred.";

    if (error.response?.status === 401) {
      // Clear token on 401 if it's an unauthorized expired session
      if (localStorage.getItem("joy_hub_token")) {
        localStorage.removeItem("joy_hub_token");
        localStorage.removeItem("joy_hub_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
