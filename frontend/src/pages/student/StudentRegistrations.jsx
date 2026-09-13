import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { StatusBadge } from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import { Ticket, Calendar, MapPin, Eye, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function StudentRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [selectedReg, setSelectedReg] = useState(null);

  const fetchRegistrations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/registrations/my?page=${page}&limit=10`);
      if (res.success) {
        setRegistrations(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations(1);
  }, []);

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
      header: "Event Date",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.event?.eventDate ? new Date(row.event.eventDate).toLocaleDateString() : "TBA"}
        </span>
      )
    },
    {
      header: "Registered On",
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
      header: "Action",
      render: (row) => (
        <button
          onClick={() => setSelectedReg(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pass / Slip</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Event Registrations
        </h1>
        <p className="text-xs text-slate-500">
          View your confirmed entry passes, registration IDs, and submission details.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={registrations}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchRegistrations}
        emptyMessage="You have not registered for any campus events yet."
      />

      {/* Entry Slip Modal */}
      <Modal
        isOpen={!!selectedReg}
        onClose={() => setSelectedReg(null)}
        title="Official Event Entry Pass"
        maxWidth="max-w-md"
      >
        {selectedReg && (
          <div className="text-center space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="p-3 bg-white rounded-xl inline-block shadow-sm border border-slate-200">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: "JOY_ENTRY_PASS",
                    regId: selectedReg.registrationId,
                    eventId: selectedReg.event?._id,
                    studentId: selectedReg.student
                  })}
                  size={160}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Registration ID
                </span>
                <p className="font-mono text-base font-bold text-blue-950">
                  {selectedReg.registrationId}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Event:</span>
                  <span className="font-bold text-slate-900">{selectedReg.event?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Venue:</span>
                  <span className="font-semibold text-slate-700">{selectedReg.event?.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedReg.event?.startTime} — {selectedReg.event?.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <StatusBadge status={selectedReg.status} />
                </div>
              </div>

              {/* Dynamic form responses if any */}
              {selectedReg.customFormData && Object.keys(selectedReg.customFormData).length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 text-left space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Form Submission
                  </span>
                  {Object.entries(selectedReg.customFormData).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-[11px]">
                      <span className="text-slate-500 capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedReg(null)}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close Pass
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
