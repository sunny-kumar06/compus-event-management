import React, { useState, useEffect } from "react";
import api from "../../services/api";
import DataTable from "../../components/common/DataTable";
import { GraduationCap, Mail, Phone, Calendar, Search } from "lucide-react";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });

  const fetchTeachers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(`/teachers?${params.toString()}`);
      if (res.success) {
        setTeachers(res.data || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(1);
  }, []);

  const columns = [
    {
      header: "Employee ID",
      accessor: "employeeId",
      render: (row) => (
        <span className="font-mono font-bold text-xs text-blue-950">
          {row.employeeId}
        </span>
      )
    },
    {
      header: "Faculty Name",
      accessor: "user",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.user?.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">{row.user?.email}</p>
        </div>
      )
    },
    {
      header: "Department",
      accessor: "department",
      render: (row) => <span className="text-xs text-slate-700">{row.department}</span>
    },
    {
      header: "Designation",
      accessor: "designation",
      render: (row) => <span className="text-xs text-slate-600 font-medium">{row.designation}</span>
    },
    {
      header: "Office",
      accessor: "officeRoom",
      render: (row) => <span className="text-xs text-slate-500">{row.officeRoom || "Academic Block"}</span>
    },
    {
      header: "Assigned Events",
      accessor: "assignedEventsCount",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
          <Calendar className="w-3.5 h-3.5 text-blue-700" />
          <span>{row.assignedEventsCount || 0} Events</span>
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Faculty Directory & Coordinators
        </h1>
        <p className="text-xs text-slate-500">
          Faculty coordinators designated for campus events, live attendance, and judging.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchTeachers}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          fetchTeachers(1);
        }}
        searchPlaceholder="Search faculty by name or email..."
      />
    </div>
  );
}
