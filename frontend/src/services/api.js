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

import {
  mockEvents,
  mockUsers,
  mockCertificates,
  mockRegistrations,
  mockAttendance,
  mockNotifications,
  mockAdminStats,
  mockStats
} from "./mockData";
import { defaultInstitution } from "../config/institution";

function getMockFallback(config) {
  const url = (config?.url || "").replace(/^\/api/, "");
  const method = (config?.method || "get").toLowerCase();

  // Authentication fallbacks
  if (url.startsWith("/auth/login")) {
    let reqEmail = "";
    try {
      const parsed = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      reqEmail = (parsed?.email || "").trim().toLowerCase();
    } catch {}
    const matchedUser = mockUsers[reqEmail] || mockUsers["sunny@joy.edu"];
    return {
      success: true,
      token: "joy_demo_token_" + Date.now(),
      user: matchedUser
    };
  }

  if (url.startsWith("/auth/me")) {
    let currentUser = mockUsers["sunny@joy.edu"];
    try {
      const savedUserStr = localStorage.getItem("joy_hub_user");
      if (savedUserStr) currentUser = JSON.parse(savedUserStr);
    } catch {}
    return {
      success: true,
      user: currentUser
    };
  }

  if (url.startsWith("/auth/register")) {
    let body = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : config.data; } catch {}
    const newUser = {
      _id: "demo_student_" + Date.now(),
      name: body.name || "New JOY Student",
      email: body.email,
      role: "student",
      phone: body.phone || "+91 98765 00000",
      rollNumber: "JOY-2023-NEW-01",
      department: body.department || "Computer Science & Engineering",
      academicYear: "1st_year",
      semester: 1
    };
    return {
      success: true,
      token: "joy_demo_token_" + Date.now(),
      user: newUser
    };
  }

  // Teacher assigned events (must be checked before /events/:id)
  if (url.startsWith("/events/teacher/assigned")) {
    return {
      success: true,
      data: mockEvents
    };
  }

  // Single event or event directory
  if (url.startsWith("/events")) {
    const matchId = url.match(/^\/events\/([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1] !== "teacher" && matchId[1] !== "admin") {
      const id = matchId[1];
      const found = mockEvents.find((e) => e._id === id) || mockEvents[0];
      return {
        success: true,
        data: found,
        userRegistration: mockRegistrations.find((r) => r.event._id === found._id) || null
      };
    }
    return {
      success: true,
      data: mockEvents,
      pagination: { page: 1, limit: 10, total: mockEvents.length, pages: 1 }
    };
  }

  // Student profile, portfolio, and directory
  if (url.startsWith("/students")) {
    const studentMatch = url.match(/^\/students\/([a-zA-Z0-9_-]+)/);
    if (studentMatch && !url.includes("?")) {
      const studentUser = mockUsers["sunny@joy.edu"];
      return {
        success: true,
        user: studentUser,
        profile: {
          rollNumber: studentUser.rollNumber || "JOY-2023-CS-001",
          department: studentUser.department || "Computer Science & Engineering",
          academicYear: studentUser.academicYear || "3rd_year",
          semester: studentUser.semester || 5
        },
        stats: {
          eventsParticipated: 4,
          certificatesCount: 2,
          firstPositions: 1,
          secondPositions: 1,
          thirdPositions: 0
        },
        registrations: mockRegistrations,
        certificates: mockCertificates,
        achievements: [
          {
            _id: "demo_ach_1",
            title: "Grand Quiz Champion",
            event: mockEvents[3],
            position: "1st",
            date: new Date(Date.now() - 5 * 86400000).toISOString()
          }
        ]
      };
    }
    const studentList = Object.values(mockUsers)
      .filter((u) => u.role === "student")
      .map((s) => ({
        _id: s._id,
        rollNumber: s.rollNumber || "JOY-2023-001",
        department: s.department || "Computer Science & Engineering",
        academicYear: s.academicYear || "3rd_year",
        semester: s.semester || 5,
        user: s
      }));
    return {
      success: true,
      data: studentList,
      pagination: { page: 1, limit: 12, total: studentList.length, pages: 1 }
    };
  }

  // Teachers directory
  if (url.startsWith("/teachers")) {
    const teacherList = Object.values(mockUsers)
      .filter((u) => u.role === "teacher")
      .map((t) => ({
        _id: t._id,
        employeeId: t.employeeId || "JOY-FAC-101",
        department: t.department || "Computer Science & Engineering",
        user: t,
        assignedEventsCount: 2
      }));
    return {
      success: true,
      data: teacherList,
      pagination: { page: 1, limit: 12, total: teacherList.length, pages: 1 }
    };
  }

  // Certificates verification & listings
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

  if (url.startsWith("/certificates")) {
    return {
      success: true,
      data: mockCertificates,
      pagination: { page: 1, limit: 12, total: mockCertificates.length, pages: 1 }
    };
  }

  // Event results podium
  if (url.startsWith("/results")) {
    return {
      success: true,
      data: {
        event: mockEvents[3],
        isPublished: true,
        generalRemarks: "Exemplary competitive spirit demonstrated across all quiz rounds.",
        winners: [
          {
            position: "1st",
            student: mockUsers["sunny@joy.edu"],
            title: "1st Position (Gold)",
            score: 98,
            remarks: "Outstanding speed and technical precision"
          },
          {
            position: "2nd",
            student: mockUsers["aman@joy.edu"],
            title: "2nd Position (Silver)",
            score: 91,
            remarks: "Superb analytical buzzer performance"
          }
        ]
      }
    };
  }

  // Notifications
  if (url.startsWith("/notifications")) {
    return {
      success: true,
      data: mockNotifications,
      unreadCount: 1
    };
  }

  // Admin stats & general stats
  if (url.startsWith("/stats/admin")) {
    return {
      success: true,
      ...mockAdminStats
    };
  }

  if (url.startsWith("/stats")) {
    return {
      success: true,
      data: mockStats,
      ...mockAdminStats
    };
  }

  // Attendance
  if (url.startsWith("/attendance/my")) {
    return {
      success: true,
      data: mockAttendance,
      stats: { totalAttended: 1, presentCount: 1, lateCount: 0 }
    };
  }

  if (url.startsWith("/attendance/events")) {
    return {
      success: true,
      participants: [
        {
          _id: "demo_att_p1",
          rollNumber: "JOY-2023-CS-001",
          name: "Sunny Kumar",
          department: "Computer Science & Engineering",
          academicYear: "3rd Year",
          attendanceStatus: "present",
          timestamp: new Date().toISOString(),
          markedMethod: "qr_scan"
        },
        {
          _id: "demo_att_p2",
          rollNumber: "JOY-2023-CS-002",
          name: "Aman Sharma",
          department: "Computer Science & Engineering",
          academicYear: "3rd Year",
          attendanceStatus: "not_marked",
          timestamp: null,
          markedMethod: "N/A"
        }
      ],
      stats: {
        totalRegistered: 2,
        totalPresent: 1,
        attendanceRate: 50
      }
    };
  }

  if (url.includes("/live-qr") || url.includes("/start")) {
    return {
      success: true,
      token: "joy_demo_qr_token_" + Date.now(),
      qrCodeData: "JOY_ROTATING_ATTENDANCE_HASH_SAMPLE",
      expiresAt: new Date(Date.now() + 15000).toISOString()
    };
  }

  // Registrations
  if (url.startsWith("/registrations/my")) {
    return {
      success: true,
      data: mockRegistrations,
      pagination: { page: 1, limit: 10, total: mockRegistrations.length, pages: 1 }
    };
  }

  if (url.includes("/registrations")) {
    return {
      success: true,
      data: mockRegistrations,
      pagination: { page: 1, limit: 15, total: mockRegistrations.length, pages: 1 }
    };
  }

  // Institution settings
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

  // Modifying mutations (POST, PUT, DELETE) fallback in demo mode
  if (method === "post" || method === "put" || method === "delete") {
    return {
      success: true,
      message: "Operation completed successfully (Demo Mode).",
      data: {
        _id: "demo_id_" + Date.now(),
        registrationId: "JOY-EVT-2026-" + Math.floor(100000 + Math.random() * 900000),
        status: "confirmed"
      }
    };
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
