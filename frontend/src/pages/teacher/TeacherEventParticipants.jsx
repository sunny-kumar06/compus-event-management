import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import DataTable from "../../components/common/DataTable";
import { StatusBadge } from "../../components/common/Badge";
import { ArrowLeft, Download, Check, X, Search, Users, ShieldAlert } from "lucide-react";

export default function TeacherEventParticipants() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  const fetchEventAndParticipants = async (page = 1) => {
    try {
      setLoading(true);
      // Fetch event info
      const eventRes = await api.get(`/events/${id}`);
      if (eventRes.success) setEvent(eventRes.data);

      // Fetch participants
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 15);
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const partRes = await api.get(`/registrations/events/${id}/registrations?${params.toString()}`);
      if (partRes.success) {
        setParticipants(partRes.data || []);
        setPagination(partRes.pagination);
      }
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndParticipants(1);
  }, [id, statusFilter]);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      fetchEventAndParticipants(1);
    }
  };

  const handleUpdateStatus = async (registrationId, newStatus) => {
    try {
      const res = await api.put(`/registrations/${registrationId}/status`, { status: newStatus });
      if (res.success) {
        setParticipants((prev) =>
          prev.map((r) => (r._id === registrationId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert("No participant records to export.");
      return;
    }

    const headers = ["Registration ID", "Student Name", "Email", "Phone", "Status", "Registered At"];
    const rows = participants.map((p) => [
      p.registrationId,
      `"${p.student?.name || ""}"`,
      p.student?.email || "",
      p.student?.phone || "",
      p.status,
      new Date(p.registeredAt).toLocaleString()
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event?.title || "event"}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "Registration ID",
      accessor: "registrationId",
      render: (row) => (
        <span className="font-mono font-bold text-blue-950 text-xs">
          {row.registrationId}
        </span>
      )
    },
    {
      header: "Student Name",
      accessor: "student",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.student?.name}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.student?.email}</p>
        </div>
      )
    },
    {
      header: "Custom Form Data",
      render: (row) => {
        if (!row.customFormData || Object.keys(row.customFormData).length === 0) {
          return <span className="text-slate-400 text-xs">Standard</span>;
        }
        return (
          <div className="text-[11px] space-y-0.5 text-slate-600 max-w-xs">
            {Object.entries(row.customFormData).slice(0, 2).map(([k, v]) => (
              <p key={k} className="truncate">
                <strong className="capitalize">{k.replace(/_/g, " ")}:</strong>{" "}
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </p>
            ))}
          </div>
        );
      }
    },
    {
      header: "Registration Date",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.registeredAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Approval Action",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== "confirmed" && (
            <button
              onClick={() => handleUpdateStatus(row._id, "confirmed")}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Approve Registration"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {row.status !== "rejected" && (
            <button
              onClick={() => handleUpdateStatus(row._id, "rejected")}
              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
              title="Reject Registration"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back button and title */}
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
            Participants Roster: {event?.title || "Event"}
          </h1>
          <p className="text-xs text-slate-500">
            Review registered students, approve or reject applications, and export rosters.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search participant name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchEventAndParticipants(1)}
            className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-64"
          />
          <button
            onClick={() => fetchEventAndParticipants(1)}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-900 rounded-xl"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          {["all", "confirmed", "pending", "rejected"].map((s) => (
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={participants}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchEventAndParticipants(p)}
        emptyMessage="No participants registered yet for this event."
      />
    </div>
  );
}
