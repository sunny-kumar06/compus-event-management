import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import { Users, Search, GraduationCap, Award, Trophy, Eye } from "lucide-react";

export default function AdminStudents() {
  const { departments } = useInstitution();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (search.trim()) params.append("search", search.trim());
      if (departmentFilter && departmentFilter !== "all") params.append("department", departmentFilter);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.success) {
        setStudents(res.data || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [departmentFilter]);

  const viewStudentPortfolio = async (studentUserId) => {
    try {
      setLoadingDetails(true);
      setSelectedStudent(studentUserId);
      const res = await api.get(`/students/${studentUserId}`);
      if (res.success) {
        setStudentDetails(res);
      }
    } catch (err) {
      alert(err.message || "Failed to load student details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const columns = [
    {
      header: "Roll Number",
      accessor: "rollNumber",
      render: (row) => (
        <span className="font-mono font-bold text-xs text-blue-950">
          {row.rollNumber}
        </span>
      )
    },
    {
      header: "Student Name",
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
      header: "Year / Semester",
      render: (row) => (
        <span className="text-xs text-slate-600 capitalize">
          {row.academicYear?.replace("_", " ")} • Sem {row.semester}
        </span>
      )
    },
    {
      header: "Co-Curricular Honors",
      render: (row) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            🥇 {row.participationStats?.firstPositions || 0}
          </span>
          <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded-full font-bold">
            🥈 {row.participationStats?.secondPositions || 0}
          </span>
          <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            🎓 {row.participationStats?.certificatesIssued || 0}
          </span>
        </div>
      )
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => viewStudentPortfolio(row.user?._id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Portfolio</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Directory & Co-Curricular Profiles
        </h1>
        <p className="text-xs text-slate-500">
          Server-paginated student roster with verified event participation records.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchStudents}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          fetchStudents(1);
        }}
        searchPlaceholder="Search student by name or email..."
        actions={
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.id}
              </option>
            ))}
          </select>
        }
      />

      {/* Student Details & Transcript Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => {
          setSelectedStudent(null);
          setStudentDetails(null);
        }}
        title="Student Co-Curricular Profile"
        maxWidth="max-w-2xl"
      >
        {loadingDetails || !studentDetails ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student transcript...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white font-bold flex items-center justify-center text-lg">
                {studentDetails.student?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{studentDetails.student?.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {studentDetails.profile?.rollNumber} • {studentDetails.profile?.department}
                </p>
                <p className="text-[11px] text-slate-400">{studentDetails.student?.email}</p>
              </div>
            </div>

            {/* Honors stats */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-900 uppercase">Events</span>
                <p className="text-xl font-bold text-blue-950">{studentDetails.stats?.eventsParticipated}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-900 uppercase">1st Place</span>
                <p className="text-xl font-bold text-amber-950">🥇 {studentDetails.stats?.firstPositions}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-900 uppercase">2nd Place</span>
                <p className="text-xl font-bold text-purple-950">🥈 {studentDetails.stats?.secondPositions}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-900 uppercase">Certificates</span>
                <p className="text-xl font-bold text-emerald-950">{studentDetails.stats?.certificatesCount}</p>
              </div>
            </div>

            {/* Honors list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">Verified Achievement List:</span>
              {(studentDetails.achievements || []).length > 0 ? (
                studentDetails.achievements.map((a, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{a.eventTitle}</span>
                      <p className="text-[11px] text-amber-800">{a.title}</p>
                    </div>
                    <span className="font-semibold text-slate-500">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No podium rankings recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
