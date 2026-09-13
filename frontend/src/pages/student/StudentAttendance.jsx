import React, { useState, useEffect } from "react";
import api from "../../services/api";
import QRScannerModal from "../../components/attendance/QRScannerModal";
import { StatusBadge } from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import StatCard from "../../components/common/StatCard";
import { QrCode, CheckCircle2, Clock, Calendar, ShieldCheck } from "lucide-react";

export default function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({ totalAttended: 0, presentCount: 0, lateCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/my");
      if (res.success) {
        setAttendanceData(res.data || []);
        setStats(res.stats || { totalAttended: 0, presentCount: 0, lateCount: 0 });
      }
    } catch (err) {
      console.error("Failed to load attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const columns = [
    {
      header: "Event Title",
      accessor: "event",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.event?.title || "Event"}</p>
          <p className="text-[11px] text-slate-400 capitalize">{row.event?.category} • {row.event?.venue}</p>
        </div>
      )
    },
    {
      header: "Attendance Date & Time",
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-700 block">
            {new Date(row.timestamp).toLocaleDateString()}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {new Date(row.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )
    },
    {
      header: "Verification Method",
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono uppercase">
          {row.markedMethod || "qr_scan"}
        </span>
      )
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Event Attendance Hub
          </h1>
          <p className="text-xs text-slate-500">
            Mark your real-time attendance using the rotating camera scanner or token.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-md transition-all hover:scale-105 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Mark Attendance Now</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Events Attended"
          value={stats.totalAttended}
          subtitle="Lifetime campus events"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Present Records"
          value={stats.presentCount}
          subtitle="On-time verifications"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Late / Override"
          value={stats.lateCount}
          subtitle="Auditorium late marks"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Attendance History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Personal Attendance Record</h3>
        <DataTable
          columns={columns}
          data={attendanceData}
          loading={loading}
          emptyMessage="No attendance logs found. Scan a live QR code during your next event."
        />
      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAttendanceSuccess={fetchAttendance}
      />
    </div>
  );
}
