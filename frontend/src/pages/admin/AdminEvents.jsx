import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DataTable from "../../components/common/DataTable";
import { StatusBadge, CategoryBadge } from "../../components/common/Badge";
import { Plus, Edit, Trash2, Users, QrCode, Trophy, Eye } from "lucide-react";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      params.append("includeDrafts", "true");
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.success) {
        setEvents(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, [statusFilter]);

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents(pagination.page);
    } catch (err) {
      alert(err.message || "Failed to delete event.");
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/events/${eventId}`, { status: newStatus });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  const columns = [
    {
      header: "Event",
      accessor: "title",
      render: (row) => (
        <div className="max-w-xs">
          <Link to={`/events/${row._id}`} className="font-bold text-slate-900 text-xs hover:text-blue-900 line-clamp-1">
            {row.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={row.category} />
            <span className="text-[11px] text-slate-400">{row.venue}</span>
          </div>
        </div>
      )
    },
    {
      header: "Date & Time",
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">
            {new Date(row.eventDate).toLocaleDateString()}
          </span>
          <span className="text-[11px] text-slate-400">
            {row.startTime} — {row.endTime}
          </span>
        </div>
      )
    },
    {
      header: "Enrolled",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.currentRegistrationsCount || 0} / {row.maxCapacity || "∞"}
        </span>
      )
    },
    {
      header: "Faculty Coordinators",
      render: (row) => (
        <div className="text-xs text-slate-600">
          {(row.facultyCoordinators || []).length > 0
            ? row.facultyCoordinators.map((f) => f.name).join(", ")
            : "None assigned"}
        </div>
      )
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="registration_open">Open</option>
          <option value="registration_closed">Closed</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )
    },
    {
      header: "Management Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/teacher/events/${row._id}/participants`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors"
            title="Participants Roster"
          >
            <Users className="w-4 h-4" />
          </Link>
          <Link
            to={`/teacher/events/${row._id}/attendance`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Attendance & QR"
          >
            <QrCode className="w-4 h-4" />
          </Link>
          <Link
            to={`/teacher/events/${row._id}/results`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
            title="Results & Certificates"
          >
            <Trophy className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row._id, row.title)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Event Management Console
          </h1>
          <p className="text-xs text-slate-500">
            Publish, edit, configure coordinators, and monitor campus events.
          </p>
        </div>

        <Link
          to="/admin/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={events}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchEvents}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          fetchEvents(1);
        }}
        searchPlaceholder="Search event title..."
        actions={
          <div className="flex items-center gap-1.5">
            {["all", "registration_open", "completed", "draft"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === st ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
}
