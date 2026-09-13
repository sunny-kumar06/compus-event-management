import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useInstitution } from "../../context/InstitutionContext";
import StatCard from "../../components/common/StatCard";
import { StatusBadge, CategoryBadge } from "../../components/common/Badge";
import LiveRotatingQRModal from "../../components/attendance/LiveRotatingQRModal";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Trophy,
  QrCode,
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { institution } = useInstitution();
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);

  const fetchAssignedEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/teacher/assigned");
      if (res.success) {
        setAssignedEvents(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load assigned events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedEvents();
  }, []);

  const totalAssigned = assignedEvents.length;
  const totalParticipants = assignedEvents.reduce((acc, evt) => acc + (evt.currentRegistrationsCount || 0), 0);
  const upcomingEvents = assignedEvents.filter((e) => new Date(e.eventDate) >= new Date()).length;
  const completedEvents = assignedEvents.filter((e) => e.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Faculty Coordinator Portal — {institution.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Manage your assigned events, track live student attendance via rotating QR, and publish verified results.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Events"
          value={totalAssigned}
          subtitle="Events coordinated by you"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Registrations"
          value={totalParticipants}
          subtitle="Registered participants"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents}
          subtitle="Awaiting execution"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Completed Events"
          value={completedEvents}
          subtitle="Results & certificates issued"
          icon={Trophy}
          color="amber"
        />
      </div>

      {/* Assigned Events Roster */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-900" />
              <span>Assigned Events Workspace</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty members have exclusive access to manage registrations, start live attendance sessions, and declare results for their assigned events.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading assigned events...</div>
        ) : assignedEvents.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No events are currently assigned to you. When campus administrators assign you as a faculty coordinator, they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedEvents.map((evt) => (
              <div
                key={evt._id}
                className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={evt.category} />
                    <StatusBadge status={evt.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{evt.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(evt.eventDate).toLocaleDateString()} • {evt.startTime} — {evt.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.currentRegistrationsCount || 0} Registered / {evt.maxCapacity || "∞"}</span>
                    </div>
                  </div>
                </div>

                {/* Teacher Actions for this event */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/teacher/events/${evt._id}/participants`}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Participants ({evt.currentRegistrationsCount || 0})
                  </Link>

                  <Link
                    to={`/teacher/events/${evt._id}/attendance`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Attendance</span>
                  </Link>

                  <Link
                    to={`/teacher/events/${evt._id}/results`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>Results</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedEventForQR(evt)}
                    className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Live QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Rotating QR Modal */}
      {selectedEventForQR && (
        <LiveRotatingQRModal
          isOpen={!!selectedEventForQR}
          onClose={() => setSelectedEventForQR(null)}
          event={selectedEventForQR}
          onAttendanceChanged={fetchAssignedEvents}
        />
      )}
    </div>
  );
}
