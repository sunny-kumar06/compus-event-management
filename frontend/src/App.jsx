import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { InstitutionProvider } from "./context/InstitutionContext";
import { NotificationProvider } from "./context/NotificationContext";

// Common components
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import Footer from "./components/common/Footer";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import EventsDirectory from "./pages/public/EventsDirectory";
import EventDetailPage from "./pages/public/EventDetailPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import VerifyCertificatePage from "./pages/public/VerifyCertificatePage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentRegistrations from "./pages/student/StudentRegistrations";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentResults from "./pages/student/StudentResults";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentAchievements from "./pages/student/StudentAchievements";
import StudentProfile from "./pages/student/StudentProfile";
import StudentNotifications from "./pages/student/StudentNotifications";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherEventParticipants from "./pages/teacher/TeacherEventParticipants";
import TeacherEventAttendance from "./pages/teacher/TeacherEventAttendance";
import TeacherEventResults from "./pages/teacher/TeacherEventResults";
import TeacherProfile from "./pages/teacher/TeacherProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventWizard from "./pages/admin/AdminEventWizard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminSettings from "./pages/admin/AdminSettings";

// Global Error Boundary to catch any runtime crashes and prevent white screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center mx-auto text-2xl font-bold">
              🎓
            </div>
            <h2 className="text-lg font-bold text-slate-900">Application Notice</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("joy_hub_token");
                    localStorage.removeItem("joy_hub_user");
                  } catch {}
                  window.location.reload();
                }}
                className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Role-based Protected Route wrapper
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

// Layout for Dashboard pages (with Sidebar)
function PortalLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

// Public Layout
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InstitutionProvider>
          <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/events" element={<PublicLayout><EventsDirectory /></PublicLayout>} />
              <Route path="/events/:id" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-certificate/:certificateId" element={<PublicLayout><VerifyCertificatePage /></PublicLayout>} />
              <Route path="/verify-certificate" element={<PublicLayout><VerifyCertificatePage /></PublicLayout>} />

              {/* Student Portal Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentDashboard /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/events"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><EventsDirectory /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/events/:id"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><EventDetailPage /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/registrations"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentRegistrations /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentAttendance /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentResults /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/certificates"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentCertificates /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/achievements"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentAchievements /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notifications"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentNotifications /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentProfile /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PortalLayout><StudentProfile /></PortalLayout>
                  </ProtectedRoute>
                }
              />

              {/* Teacher Portal Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><TeacherDashboard /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><TeacherDashboard /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id/participants"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><TeacherEventParticipants /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id/attendance"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><TeacherEventAttendance /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id/results"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><TeacherEventResults /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><TeacherProfile /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/notifications"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PortalLayout><StudentNotifications /></PortalLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminDashboard /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminEvents /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/create"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminEventWizard /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminEventWizard /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/registrations"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><TeacherEventParticipants /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/attendance"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><TeacherEventAttendance /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/results"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><TeacherEventResults /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminStudents /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminTeachers /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/certificates"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminCertificates /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><AdminSettings /></PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PortalLayout><StudentNotifications /></PortalLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </InstitutionProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
