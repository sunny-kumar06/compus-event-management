import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "../common/Modal";
import { RefreshCw, StopCircle, Users, ShieldAlert, CheckCircle2, Copy } from "lucide-react";

export default function LiveRotatingQRModal({ isOpen, onClose, event, onAttendanceChanged }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [copied, setCopied] = useState(false);

  const fetchLiveQR = async () => {
    if (!event) return;
    try {
      setError("");
      const res = await api.get(`/attendance/events/${event._id}/live-qr`);
      if (res.success) {
        setQrData(res);
        setSecondsRemaining(res.secondsRemaining || 30);
      }
    } catch (err) {
      setError(err.message || "Failed to load live QR code.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    let timerId;

    if (isOpen && event) {
      setLoading(true);
      fetchLiveQR();

      // Countdown ticker every second
      timerId = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            fetchLiveQR();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerId);
      clearInterval(intervalId);
    };
  }, [isOpen, event]);

  const handleStopSession = async () => {
    if (!window.confirm("Are you sure you want to stop this attendance session? Students will no longer be able to mark attendance.")) {
      return;
    }
    try {
      await api.post(`/attendance/events/${event._id}/stop`);
      if (onAttendanceChanged) onAttendanceChanged();
      onClose();
    } catch (err) {
      alert(err.message || "Failed to stop session.");
    }
  };

  const handleCopyToken = () => {
    if (qrData?.token) {
      navigator.clipboard.writeText(qrData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Rotating QR Attendance"
      maxWidth="max-w-md"
    >
      <div className="text-center space-y-6">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{event?.title}</h4>
          <p className="text-xs text-slate-500 mt-1">
            Display this screen to students in the classroom or auditorium.
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs">
            <ShieldAlert className="w-5 h-5 mx-auto mb-2 text-rose-500" />
            <p>{error}</p>
            <button
              onClick={fetchLiveQR}
              className="mt-3 px-3 py-1.5 bg-white border border-rose-300 rounded-lg font-bold hover:bg-rose-100/50 transition-colors"
            >
              Retry Session
            </button>
          </div>
        ) : loading && !qrData ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-3">Initializing secure session...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code Container */}
            <div className="relative inline-block p-4 bg-white rounded-3xl border-2 border-blue-900 shadow-xl mx-auto">
              <img
                src={qrData?.qrCodeDataUrl}
                alt="Live Rotating QR"
                className="w-56 h-56 mx-auto rounded-xl object-contain"
              />
              <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-900 text-white shadow">
                  JOY University Secure
                </span>
              </div>
            </div>

            {/* Timer & Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <RefreshCw className={`w-3.5 h-3.5 ${secondsRemaining <= 5 ? "animate-spin text-rose-600" : ""}`} />
                  <span>Rotating Security Token</span>
                </span>
                <span className={secondsRemaining <= 5 ? "text-rose-600 font-extrabold" : "text-slate-900 font-extrabold"}>
                  {secondsRemaining}s remaining
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    secondsRemaining <= 5 ? "bg-rose-500" : "bg-blue-900"
                  }`}
                  style={{ width: `${(secondsRemaining / (qrData?.rotationIntervalSeconds || 30)) * 100}%` }}
                />
              </div>
            </div>

            {/* Manual Token Alternative */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Manual Entry Code (No Camera)
                </span>
                <button
                  onClick={handleCopyToken}
                  className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <div className="font-mono text-xl font-black text-center tracking-widest text-slate-900 py-1 bg-white rounded-xl border border-slate-200">
                {qrData?.token || "------"}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Keep Running in Background
              </button>
              <button
                type="button"
                onClick={handleStopSession}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
