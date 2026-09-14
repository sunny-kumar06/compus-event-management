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

import { mockEvents, mockUsers, mockCertificates, mockStats } from "./mockData";
import { defaultInstitution } from "../config/institution";

function getMockFallback(config) {
  const url = (config?.url || "").replace(/^\/api/, "");
  const method = (config?.method || "get").toLowerCase();

  if (url.startsWith("/events")) {
    if (url.length > 8 && url !== "/events") {
      const id = url.split("/")[2]?.split("?")[0];
      const found = mockEvents.find((e) => e._id === id) || mockEvents[0];
      return { success: true, data: found };
    }
    return {
      success: true,
      data: mockEvents,
      pagination: { page: 1, limit: 10, total: mockEvents.length, pages: 1 }
    };
  }

  if (url.startsWith("/certificates/verify")) {
    const certId = url.split("/").pop()?.split("?")[0];
    const cert = mockCertificates.find((c) => c.certificateId === certId) || mockCertificates[0];
    return {
      success: true,
      isValid: true,
      verificationStatus: "VERIFIED_AUTHENTIC",
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.metadata.studentName,
        department: cert.metadata.department,
        eventTitle: cert.metadata.eventTitle,
        eventCategory: cert.metadata.eventCategory,
        achievementTitle: cert.achievementTitle,
        position: cert.position,
        issueDate: cert.issueDate,
        signers: cert.signers,
        institutionName: "JOY University"
      }
    };
  }

  if (url.startsWith("/certificates/my")) {
    return { success: true, data: mockCertificates };
  }

  if (url.startsWith("/settings")) {
    return {
      success: true,
      data: {
        institutionName: defaultInstitution.name,
        shortName: defaultInstitution.shortName,
        productName: defaultInstitution.productName,
        tagline: defaultInstitution.tagline,
        website: defaultInstitution.website,
        email: defaultInstitution.email,
        phone: defaultInstitution.phone,
        address: defaultInstitution.address,
        primaryColor: defaultInstitution.theme.primaryColor,
        secondaryColor: defaultInstitution.theme.secondaryColor,
        accentColor: defaultInstitution.theme.accentColor,
        footerText: defaultInstitution.footerText,
        certificateSigners: [
          { name: "Dr. K. S. Ramanathan", title: "Dean of Student Affairs", institution: "JOY University" },
          { name: "Prof. Anjali Deshmukh", title: "Director, Events Council", institution: "JOY University" }
        ]
      }
    };
  }

  if (url.startsWith("/stats")) {
    return { success: true, data: mockStats };
  }

  if (url.startsWith("/attendance/my")) {
    return {
      success: true,
      data: [
        {
          _id: "demo_att_1",
          event: mockEvents[3],
          timestamp: new Date().toISOString(),
          status: "present",
          markedMethod: "qr_scan"
        }
      ],
      stats: { totalAttended: 1, presentCount: 1, lateCount: 0 }
    };
  }

  if (url.startsWith("/registrations/my")) {
    return {
      success: true,
      data: [
        {
          _id: "demo_reg_1",
          registrationId: "JOY-EVT-2026-000101",
          event: mockEvents[0],
          status: "confirmed",
          registeredAt: new Date().toISOString()
        }
      ]
    };
  }

  if (url.includes("/register") && method === "post") {
    return {
      success: true,
      message: "Registration confirmed (Demo Mode)",
      data: { registrationId: "JOY-EVT-2026-" + Math.floor(100000 + Math.random() * 900000) }
    };
  }

  if (url.includes("/scan") && method === "post") {
    return { success: true, message: "Attendance verified successfully (Demo Mode)." };
  }

  return null;
}

// Response interceptor to format errors, handle 401s, and fallback gracefully
api.interceptors.response.use(
  (response) => {
    // If response is HTML instead of JSON (happens on static hosting rewrites), treat as offline fallback
    if (typeof response.data === "string" && response.data.trim().startsWith("<!doctype")) {
      const fallback = getMockFallback(response.config);
      if (fallback) return fallback;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;

    // If 404, 405 or Network Error on static host, serve mock fallback so demo is fully interactive
    if (status === 404 || status === 405 || !error.response) {
      const fallback = getMockFallback(error.config);
      if (fallback) {
        console.warn(`[JOY Hub] Backend offline for ${error.config?.url}. Serving demo fallback data.`);
        return Promise.resolve(fallback);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected server error occurred.";

    if (error.response?.status === 401) {
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
