import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import LiveRotatingQRModal from "../../components/attendance/LiveRotatingQRModal";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";
import { StatusBadge } from "../../components/common/Badge";
import {
  ArrowLeft,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Play,
  StopCircle,
  Search
} from "lucide-react";

export default function TeacherEventAttendance() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const eventRes = await api.get(`/events/${id}`);
      if (eventRes.success) setEvent(eventRes.data);

      const attRes = await api.get(`/attendance/events/${id}`);
      if (attRes.success) {
        setAttendanceData(attRes);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const handleStartSession = async () => {
    try {
      const res = await api.post(`/attendance/events/${id}/start`);
      if (res.success) {
        setIsQRModalOpen(true);
        fetchAttendance();
      }
    } catch (err) {
      alert(err.message || "Failed to start attendance session.");
    }
  };

  const handleManualStatusChange = async (studentId, registrationId, currentAttId, newStatus) => {
    try {
      await api.put(`/attendance/${currentAttId || "new"}`, {
        status: newStatus,
        eventId: id,
        studentId,
        registrationId
      });
      fetchAttendance();
    } catch (err) {
      alert(err.message || "Failed to update attendance.");
    }
  };

  const handleExportCSV = () => {
    if (!attendanceData?.participants || attendanceData.participants.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = ["Roll Number", "Name", "Department", "Year", "Attendance Status", "Verification Time", "Method"];
    const rows = attendanceData.participants.map((p) => [
      `"${p.rollNumber || ""}"`,
      `"${p.name || ""}"`,
      `"${p.department || ""}"`,
      p.academicYear || "",
      p.attendanceStatus,
      p.timestamp ? new Date(p.timestamp).toLocaleString() : "Not Checked In",
      p.markedMethod || "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event?.title || "event"}_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = (attendanceData?.participants || []).filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.attendanceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: "Roll Number",
      accessor: "rollNumber",
      render: (row) => <span className="font-mono font-bold text-xs text-slate-800">{row.rollNumber}</span>
    },
    {
      header: "Participant",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.department} • {row.academicYear?.replace("_", " ")}</p>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "attendanceStatus",
      render: (row) => <StatusBadge status={row.attendanceStatus} />
    },
    {
      header: "Verification Time",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.timestamp ? new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
        </span>
      )
    },
    {
      header: "Method",
      render: (row) => (
        <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          {row.markedMethod || "—"}
        </span>
      )
    },
    {
      header: "Manual Override",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => handleManualStatusChange(row.studentId, row.registrationId, row.attendanceId, "present")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              row.attendanceStatus === "present"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Present
          </button>
          <button
            onClick={() => handleManualStatusChange(row.studentId, row.registrationId, row.attendanceId, "late")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              row.attendanceStatus === "late"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Late
          </button>
          <button
            onClick={() => handleManualStatusChange(row.studentId, row.registrationId, row.attendanceId, "absent")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              row.attendanceStatus === "absent"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Absent
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with back button & live QR trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/teacher/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assigned Events</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Dashboard: {event?.title || "Event"}
          </h1>
          <p className="text-xs text-slate-500">
            Real-time rotating QR verification, live attendance rates, and participant audits.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {attendanceData?.isSessionActive ? (
            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-md rounded-xl transition-all animate-pulse"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Show Live QR Screen</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSession}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 shadow-md rounded-xl transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Attendance Session</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered"
          value={attendanceData?.stats?.totalRegistered || 0}
          subtitle="Enrolled students"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Present Now"
          value={attendanceData?.stats?.totalPresent || 0}
          subtitle="Verified through QR"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Absent / Unmarked"
          value={attendanceData?.stats?.totalAbsent || 0}
          subtitle="Yet to check in"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceData?.stats?.attendancePercentage || 0}%`}
          subtitle="Participation turnout"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          {["all", "present", "late", "absent"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === s
                  ? "bg-blue-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Participants Attendance Table */}
      <DataTable
        columns={columns}
        data={filteredParticipants}
        loading={loading}
        emptyMessage="No participant attendance records found."
      />

      {/* Live Rotating QR Modal */}
      {event && (
        <LiveRotatingQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          event={event}
          onAttendanceChanged={fetchAttendance}
        />
      )}
    </div>
  );
}
