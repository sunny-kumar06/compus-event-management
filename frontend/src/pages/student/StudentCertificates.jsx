import React, { useState, useEffect } from "react";
import api from "../../services/api";
import CertificateViewer from "../../components/certificates/CertificateViewer";
import Modal from "../../components/common/Modal";
import DataTable from "../../components/common/DataTable";
import { Award, Eye, ShieldCheck, Download, Share2 } from "lucide-react";

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [activeCert, setActiveCert] = useState(null);

  const fetchCertificates = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/certificates/my?page=${page}&limit=10`);
      if (res.success) {
        setCertificates(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates(1);
  }, []);

  const columns = [
    {
      header: "Certificate ID",
      accessor: "certificateId",
      render: (row) => (
        <span className="font-mono font-bold text-blue-950 text-xs">
          {row.certificateId}
        </span>
      )
    },
    {
      header: "Event Title",
      accessor: "event",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.event?.title || "Event"}</p>
          <p className="text-[11px] text-slate-400 capitalize">{row.event?.category}</p>
        </div>
      )
    },
    {
      header: "Achievement / Award",
      accessor: "achievementTitle",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>{row.achievementTitle}</span>
        </span>
      )
    },
    {
      header: "Issued Date",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {new Date(row.issueDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => setActiveCert(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View & Download</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Verified Certificates
        </h1>
        <p className="text-xs text-slate-500">
          Official tamper-proof certificates of merit and participation issued by JOY University.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={certificates}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchCertificates}
        emptyMessage="No certificates issued yet. Participate in events to earn official verified credentials."
      />

      {/* Certificate Modal */}
      <Modal
        isOpen={!!activeCert}
        onClose={() => setActiveCert(null)}
        title="Official JOY University Certificate"
        maxWidth="max-w-4xl"
      >
        {activeCert && <CertificateViewer certificate={activeCert} />}
      </Modal>
    </div>
  );
}
