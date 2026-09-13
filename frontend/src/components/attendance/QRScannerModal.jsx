import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Modal from "../common/Modal";
import confetti from "canvas-confetti";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, Keyboard, CheckCircle2, AlertCircle, Camera } from "lucide-react";

export default function QRScannerModal({ isOpen, onClose, defaultEventId = null, onAttendanceSuccess }) {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' or 'manual'
  const [tokenInput, setTokenInput] = useState("");
  const [eventIdInput, setEventIdInput] = useState(defaultEventId || "");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const scannerRef = useRef(null);

  useEffect(() => {
    if (defaultEventId) {
      setEventIdInput(defaultEventId);
    }
  }, [defaultEventId]);

  // Handle Camera QR Scanner
  useEffect(() => {
    let scanner = null;
    if (isOpen && activeTab === "camera") {
      setStatusMessage(null);
      // Initialize html5-qrcode scanner
      try {
        scanner = new Html5QrcodeScanner(
          "qr-reader-container",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );

        scanner.render(
          (decodedText) => {
            handleScanSuccess(decodedText);
            if (scanner) {
              scanner.clear().catch(console.error);
            }
          },
          (error) => {
            // Quiet scan misses
          }
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.warn("Camera scanner init error:", err);
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch {}
      }
    };
  }, [isOpen, activeTab]);

  const handleScanSuccess = async (qrContent) => {
    try {
      setLoading(true);
      setStatusMessage(null);

      let parsedPayload = null;
      try {
        parsedPayload = JSON.parse(qrContent);
      } catch {
        // Raw token fallback
        parsedPayload = { token: qrContent, eventId: eventIdInput };
      }

      const res = await api.post("/attendance/scan", {
        eventId: parsedPayload.eventId || eventIdInput,
        sessionId: parsedPayload.sessionId,
        token: parsedPayload.token
      });

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setStatusMessage({
          type: "success",
          text: "Attendance marked successfully! Status: PRESENT"
        });
        if (onAttendanceSuccess) onAttendanceSuccess();
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Attendance verification failed."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setStatusMessage({ type: "error", text: "Please enter the security token." });
      return;
    }
    if (!eventIdInput) {
      setStatusMessage({ type: "error", text: "Please provide a valid Event ID." });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(null);

      const res = await api.post("/attendance/scan", {
        eventId: eventIdInput,
        token: tokenInput.trim()
      });

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setStatusMessage({
          type: "success",
          text: "Attendance marked successfully! Status: PRESENT"
        });
        if (onAttendanceSuccess) onAttendanceSuccess();
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Attendance verification failed."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Event Attendance"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Tab Selection */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "camera"
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "manual"
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Enter Token Code</span>
          </button>
        </div>

        {/* Status alerts */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {activeTab === "camera" ? (
          <div className="space-y-3 text-center">
            <p className="text-xs text-slate-500">
              Point your camera towards the live rotating QR displayed on the projector or faculty screen.
            </p>
            <div
              id="qr-reader-container"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-black min-h-[260px] flex items-center justify-center text-xs text-white"
            ></div>
            <p className="text-[11px] text-slate-400">
              Requires camera permissions. Tokens rotate dynamically every 30s.
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-1">
            {!defaultEventId && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Event ID</label>
                <input
                  type="text"
                  required
                  placeholder="Paste Event ID"
                  value={eventIdInput}
                  onChange={(e) => setEventIdInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                12-Character Rotating Token
              </label>
              <input
                type="text"
                required
                maxLength={14}
                placeholder="e.g. 7A8B9C0D1E2F"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-center font-mono tracking-widest text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 uppercase"
              />
              <p className="text-[11px] text-slate-400">
                Found directly beneath the QR code on the faculty display screen.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying Token..." : "Verify & Mark Present"}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
