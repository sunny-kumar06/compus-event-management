import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import InstitutionLogo from "../../components/common/InstitutionLogo";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export default function VerifyCertificatePage() {
  const { certificateId: paramCertId } = useParams();
  const navigate = useNavigate();
  const { institution } = useInstitution();

  const [searchId, setSearchId] = useState(paramCertId || "");
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyId = async (idToVerify) => {
    if (!idToVerify || !idToVerify.trim()) return;
    try {
      setLoading(true);
      setError("");
      setCertData(null);
      const res = await api.get(`/certificates/verify/${idToVerify.trim()}`);
      if (res.success && res.certificate) {
        setCertData(res.certificate);
      }
    } catch (err) {
      setError(err.message || "Certificate record not found in JOY University registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCertId) {
      setSearchId(paramCertId);
      verifyId(paramCertId);
    }
  }, [paramCertId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify-certificate/${searchId.trim()}`);
      verifyId(searchId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <InstitutionLogo size="lg" className="justify-center" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official University Public Verification Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify Certificate Authenticity
          </h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Validate the co-curricular credentials, event winners, and merit awards issued by {institution.name}.
          </p>
        </div>

        {/* Verification Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. JOY-CERT-2026-000101)"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-2xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Certificate"}
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {loading ? (
          <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Checking cryptographically signed registry...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Certificate Not Recognized</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
            <p className="text-[11px] text-slate-400">
              Please double check the ID entered. Valid university certificate IDs follow the format{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">JOY-CERT-YYYY-XXXXXX</code>.
            </p>
          </div>
        ) : certData ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Authenticity Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Authentic Record</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Official {institution.name} Credential
              </h2>
              <p className="text-xs text-emerald-100 font-mono">
                Registry ID: {certData.certificateId}
              </p>
            </div>

            {/* Certificate Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recipient Student
                  </span>
                  <p className="text-base font-bold text-slate-900">{certData.studentName}</p>
                  <p className="text-xs text-slate-500">{certData.department}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Achievement / Honor
                  </span>
                  <p className="text-base font-extrabold text-blue-900">{certData.achievementTitle}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    {certData.position}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Event Title
                  </span>
                  <p className="text-sm font-bold text-slate-800">{certData.eventTitle}</p>
                  <p className="text-xs text-slate-500 capitalize">{certData.eventCategory} Event</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Date of Issuance
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(certData.issueDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  <p className="text-xs text-slate-400">Issued at {institution.name}</p>
                </div>
              </div>

              {/* Authorized Signatures */}
              <div className="pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Authorized University Signatories
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(certData.signers || []).map((signer, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                      <p className="font-bold text-slate-900">{signer.name}</p>
                      <p className="text-[11px] text-slate-500">{signer.title}</p>
                      <p className="text-[10px] text-slate-400">{institution.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security watermark footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Verified against cryptographic SHA256 ledger</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
