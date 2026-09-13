import React, { useState, useEffect } from "react";
import api from "../../services/api";
import DataTable from "../../components/common/DataTable";
import CertificateViewer from "../../components/certificates/CertificateViewer";
import Modal from "../../components/common/Modal";
import { Award, Eye, ShieldCheck, Share2, Search } from "lucide-react";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(`/certificates?${params.toString()}`);
      if (res.success) {
        setCertificates(res.data || []);
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
        <span className="font-mono font-bold text-xs text-blue-950">
          {row.certificateId}
        </span>
      )
    },
    {
      header: "Recipient",
      accessor: "student",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.student?.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">{row.student?.email}</p>
        </div>
      )
    },
    {
      header: "Event",
      accessor: "event",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-800">
          {row.event?.title || "Event"}
        </span>
      )
    },
    {
      header: "Honor / Achievement",
      accessor: "achievementTitle",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>{row.achievementTitle}</span>
        </span>
      )
    },
    {
      header: "Issued On",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.issueDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => setSelectedCert(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          University Certificates Registry & Audit Log
        </h1>
        <p className="text-xs text-slate-500">
          Master registry of all issued digital credentials, cryptographic verification hashes, and awards.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={certificates}
        loading={loading}
        pagination={pagination}
        onPageChange={fetchCertificates}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          fetchCertificates(1);
        }}
        searchPlaceholder="Search certificate ID or achievement..."
      />

      {/* Certificate Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Official Certificate Audit Record"
        maxWidth="max-w-4xl"
      >
        {selectedCert && <CertificateViewer certificate={selectedCert} />}
      </Modal>
    </div>
  );
}
