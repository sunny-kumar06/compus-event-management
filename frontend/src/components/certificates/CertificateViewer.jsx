import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useInstitution } from "../../context/InstitutionContext";
import { Award, Printer, ShieldCheck, Share2, Download, CheckCircle2 } from "lucide-react";

export default function CertificateViewer({ certificate, className = "" }) {
  const { institution } = useInstitution();
  const certRef = useRef(null);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    navigator.clipboard.writeText(url);
    alert(`Public verification link copied:\n${url}`);
  };

  const studentName = certificate.metadata?.studentName || certificate.student?.name || "JOY Student";
  const rollNumber = certificate.metadata?.rollNumber || "";
  const department = certificate.metadata?.department || "Academic Department";
  const eventTitle = certificate.metadata?.eventTitle || certificate.event?.title || "University Event";
  const issueDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const signers = certificate.signers && certificate.signers.length > 0
    ? certificate.signers
    : [
        { name: "Dr. K. S. Ramanathan", title: "Dean of Student Affairs", institution: institution.name },
        { name: "Prof. Anjali Deshmukh", title: "Director, Events Council", institution: institution.name }
      ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900">Certificate ID:</span>
          <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-blue-900 font-bold">
            {certificate.certificateId}
          </code>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Verify Link</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Certificate Frame (Landscape orientation) */}
      <div
        ref={certRef}
        className="printable-certificate relative bg-white border-[12px] border-double border-blue-950 p-8 sm:p-14 rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto font-serif"
        style={{
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.15)"
        }}
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-8xl font-black uppercase tracking-widest text-blue-950 font-sans text-center">
            {institution.name}
          </span>
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-950 text-white font-bold flex items-center justify-center text-3xl shadow-lg border-2 border-amber-400">
              🎓
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-blue-950 font-sans">
              {institution.name}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 font-sans">
              Campus Events & Co-Curricular Recognition Council
            </p>
          </div>

          <div className="my-4 inline-block">
            <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-2"></div>
            <h2 className="text-lg sm:text-xl italic text-slate-700 font-serif">
              Certificate of Achievement
            </h2>
            <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2"></div>
          </div>

          {/* Recipient Details */}
          <div className="space-y-4 max-w-2xl mx-auto font-sans">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              This is proudly presented to
            </p>

            <div className="border-b-2 border-slate-300 pb-2">
              <h3 className="text-2xl sm:text-4xl font-extrabold text-blue-950 tracking-tight font-serif italic">
                {studentName}
              </h3>
              {rollNumber && (
                <p className="text-xs font-mono font-bold text-slate-500 mt-1">
                  Roll No: {rollNumber} • {department}
                </p>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-serif">
              for outstanding participation and securing the honor of
            </p>

            {/* Achievement Badge */}
            <div className="inline-block px-6 py-2 rounded-full bg-amber-50 border border-amber-300 shadow-sm">
              <span className="text-sm sm:text-base font-black text-amber-900 font-sans tracking-wide">
                {certificate.achievementTitle || "Certificate of Participation"}
              </span>
            </div>

            <p className="text-sm text-slate-700 font-serif leading-relaxed">
              in the campus event <strong className="text-blue-950 font-bold font-sans">"{eventTitle}"</strong> held at{" "}
              {institution.name} on {issueDate}.
            </p>
          </div>

          {/* Signatures and QR Code */}
          <div className="pt-10 grid grid-cols-3 items-end gap-4 font-sans text-xs">
            {/* Signer 1 */}
            <div className="text-center space-y-1">
              <div className="border-b border-slate-400 pb-1 font-serif italic text-sm text-blue-950">
                {signers[0]?.name || "Dr. K. S. Ramanathan"}
              </div>
              <p className="font-bold text-[11px] text-slate-900">{signers[0]?.title || "Dean of Student Affairs"}</p>
              <p className="text-[10px] text-slate-400">{institution.name}</p>
            </div>

            {/* Centered QR Seal */}
            <div className="flex flex-col items-center justify-center space-y-1">
              {certificate.qrCodeDataUrl ? (
                <img
                  src={certificate.qrCodeDataUrl}
                  alt="Verification QR"
                  className="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                  QR Seal
                </div>
              )}
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                {certificate.certificateId}
              </span>
            </div>

            {/* Signer 2 */}
            <div className="text-center space-y-1">
              <div className="border-b border-slate-400 pb-1 font-serif italic text-sm text-blue-950">
                {signers[1]?.name || "Prof. Anjali Deshmukh"}
              </div>
              <p className="font-bold text-[11px] text-slate-900">{signers[1]?.title || "Director of Events"}</p>
              <p className="text-[10px] text-slate-400">{institution.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
