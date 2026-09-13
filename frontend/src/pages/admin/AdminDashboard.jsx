import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import StatCard from "../../components/common/StatCard";
import { StatusBadge, CategoryBadge } from "../../components/common/Badge";
import {
  Users,
  GraduationCap,
  Calendar,
  Ticket,
  Award,
  Clock,
  CheckCircle2,
  Trophy,
  Sparkles,
  PlusCircle,
  BarChart3,
  PieChart,
  ArrowRight,
  Shield
} from "lucide-react";

export default function AdminDashboard() {
  const { institution } = useInstitution();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stats/admin");
      if (res.success) {
        setStats(res);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const summary = stats?.summary || {};
  const charts = stats?.charts || {};
  const activity = stats?.recentActivity || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Administrator Control Deck — {institution.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Campus Event Ecosystem Overview
            </h1>
            <p className="text-xs text-slate-300">
              University-wide event operations, participant metrics, faculty assignments, and verifiable credential registries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/events/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 text-blue-900" />
              <span>Create New Event</span>
            </Link>
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
            >
              <span>Institution Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents || 0}
          subtitle="Enrolled student accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Faculty Teachers"
          value={summary.totalTeachers || 0}
          subtitle="Assigned coordinators"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Total Events"
          value={summary.totalEvents || 0}
          subtitle={`${summary.upcomingEvents || 0} Upcoming • ${summary.completedEvents || 0} Completed`}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Registrations"
          value={summary.totalRegistrations || 0}
          subtitle="Total tickets issued"
          icon={Ticket}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Certificates Issued"
          value={summary.totalCertificates || 0}
          subtitle="Verifiable digital credentials"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Attendance Verified"
          value={summary.attendanceStats?.present || 0}
          subtitle={`${summary.attendanceStats?.rate || 0}% overall turnout rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Ongoing Events"
          value={summary.ongoingEvents || 0}
          subtitle="Live on campus today"
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="Upcoming Fests"
          value={summary.upcomingEvents || 0}
          subtitle="Scheduled this term"
          icon={Sparkles}
          color="blue"
        />
      </div>

      {/* Visual Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Participation Distribution */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-900" />
              <span>Branch-Wise Student Participation</span>
            </h3>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Department Metrics</span>
          </div>

          <div className="space-y-3 pt-2">
            {(charts.branchStats || []).slice(0, 5).map((b, idx) => {
              const maxCount = Math.max(...(charts.branchStats || []).map((x) => x.count), 1);
              const percent = Math.round((b.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate max-w-xs">{b._id || "Department"}</span>
                    <span className="font-mono text-slate-500">{b.count} students</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-900 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Event Category Participation</span>
            </h3>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Campus Categories</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {(charts.categoryStats || []).map((cat, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <CategoryBadge category={cat._id} />
                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Events:</span>
                  <span className="font-bold text-slate-900 text-sm">{cat.count}</span>
                </div>
                <div className="flex items-baseline justify-between text-[11px] text-slate-400">
                  <span>Enrolled:</span>
                  <span className="font-bold text-blue-900">{cat.totalRegistrations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
            <Link to="/admin/events" className="text-xs font-bold text-blue-900 hover:underline">
              View Events
            </Link>
          </div>

          <div className="space-y-3">
            {(activity.registrations || []).map((r) => (
              <div
                key={r._id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{r.student?.name}</p>
                  <p className="text-[11px] text-slate-500">{r.event?.title}</p>
                </div>
                <span className="font-mono text-[11px] font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {r.registrationId}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Certificates Issued */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Certificates Issued</h3>
            <Link to="/admin/certificates" className="text-xs font-bold text-blue-900 hover:underline">
              Audit Registry
            </Link>
          </div>

          <div className="space-y-3">
            {(activity.certificates || []).map((c) => (
              <div
                key={c._id}
                className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{c.student?.name}</p>
                  <p className="text-[11px] text-amber-900 font-semibold">{c.achievementTitle}</p>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-700">
                  {c.certificateId}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
