import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useInstitution } from "../../context/InstitutionContext";
import StatCard from "../../components/common/StatCard";
import { StatusBadge, CategoryBadge } from "../../components/common/Badge";
import QRScannerModal from "../../components/attendance/QRScannerModal";
import {
  Sparkles,
  Trophy,
  Award,
  Calendar,
  Ticket,
  QrCode,
  ArrowRight,
  Bell,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { institution } = useInstitution();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${user._id}`);
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error("Failed to load student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchStudentData();
    }
  }, [user]);

  const profile = dashboardData?.profile || user?.profile;
  const stats = dashboardData?.stats || {
    eventsParticipated: 0,
    certificatesCount: 0,
    firstPositions: 0,
    secondPositions: 0,
    thirdPositions: 0
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Welcome to {institution.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hello, {user?.name}!
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
              <span>Roll No: <strong className="text-white font-mono">{profile?.rollNumber || "JOY-STUDENT"}</strong></span>
              <span>•</span>
              <span>{profile?.department || "Engineering"}</span>
              <span>•</span>
              <span>Semester {profile?.semester || 1} ({profile?.academicYear?.replace("_", " ").toUpperCase() || "1st Year"})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              <QrCode className="w-4 h-4 text-blue-900" />
              <span>Scan Attendance</span>
            </button>
            <Link
              to="/student/events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Events</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Events Attended"
          value={stats.eventsParticipated}
          subtitle="Verified campus events"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Certificates"
          value={stats.certificatesCount}
          subtitle="Issued credentials"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="1st Positions"
          value={`🥇 ${stats.firstPositions}`}
          subtitle="Gold Champion honors"
          icon={Trophy}
          color="amber"
        />
        <StatCard
          title="2nd Positions"
          value={`🥈 ${stats.secondPositions}`}
          subtitle="Runner up titles"
          icon={Trophy}
          color="purple"
        />
        <StatCard
          title="3rd Positions"
          value={`🥉 ${stats.thirdPositions}`}
          subtitle="Bronze podium finishes"
          icon={Trophy}
          color="rose"
        />
      </div>

      {/* Two Columns: Recent Registrations & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Registrations */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-900" />
              <span>My Active Registrations</span>
            </h3>
            <Link
              to="/student/registrations"
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.recentRegistrations?.length > 0 ? (
              dashboardData.recentRegistrations.map((reg) => (
                <div
                  key={reg._id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {reg.event?.title || "Campus Event"}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {reg.registrationId} • {new Date(reg.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={reg.status} />
                    <Link
                      to={`/events/${reg.event?._id}`}
                      className="p-1.5 text-slate-400 hover:text-blue-900 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No active event registrations yet. Browse events to register!
              </div>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Recent Honors & Podium</span>
            </h3>
            <Link
              to="/student/achievements"
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              <span>Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.achievements?.length > 0 ? (
              dashboardData.achievements.slice(0, 4).map((ach, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center gap-3"
                >
                  <div className="text-2xl shrink-0">
                    {ach.position === "1st" ? "🥇" : ach.position === "2nd" ? "🥈" : "🥉"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{ach.eventTitle}</h4>
                    <p className="text-[11px] font-bold text-amber-800">{ach.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ach.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Participate in competitions and hackathons to win medals and badges!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAttendanceSuccess={fetchStudentData}
      />
    </div>
  );
}
