import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import confetti from "canvas-confetti";
import {
  Trophy,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function TeacherEventResults() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);
  const [generalRemarks, setGeneralRemarks] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const positionOptions = [
    { value: "1st", label: "🥇 1st Position (Gold)" },
    { value: "2nd", label: "🥈 2nd Position (Silver)" },
    { value: "3rd", label: "🥉 3rd Position (Bronze)" },
    { value: "winner", label: "🏆 Winner / Champion" },
    { value: "runner_up", label: "🥈 Runner Up" },
    { value: "special_mention", label: "🌟 Special Mention" },
    { value: "participation", label: "📜 Certificate of Participation" }
  ];

  const fetchEventAndResults = async () => {
    try {
      setLoading(true);
      const eventRes = await api.get(`/events/${id}`);
      if (eventRes.success) setEvent(eventRes.data);

      const regRes = await api.get(`/registrations/events/${id}/registrations?limit=200`);
      if (regRes.success) setRegistrations(regRes.data || []);

      const resRes = await api.get(`/results/events/${id}`);
      if (resRes.success && resRes.data) {
        setWinners(
          resRes.data.winners?.map((w) => ({
            position: w.position,
            student: w.student?._id || w.student,
            title: w.title,
            teamName: w.teamName,
            score: w.score,
            remarks: w.remarks
          })) || []
        );
        setGeneralRemarks(resRes.data.generalRemarks || "");
        setIsPublished(resRes.data.isPublished || false);
      }
    } catch (err) {
      console.error("Failed to load event data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndResults();
  }, [id]);

  const addWinnerRow = () => {
    if (registrations.length === 0) {
      alert("No registered students found for this event.");
      return;
    }
    const nextPos =
      winners.length === 0 ? "1st" : winners.length === 1 ? "2nd" : winners.length === 2 ? "3rd" : "special_mention";

    setWinners([
      ...winners,
      {
        position: nextPos,
        student: registrations[0].student?._id,
        title: "",
        teamName: "",
        score: "",
        remarks: ""
      }
    ]);
  };

  const updateWinner = (index, updates) => {
    const updated = [...winners];
    updated[index] = { ...updated[index], ...updates };
    setWinners(updated);
  };

  const removeWinner = (index) => {
    setWinners(winners.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setSuccessMsg("");
      const res = await api.post(`/results/events/${id}`, {
        winners,
        generalRemarks
      });
      if (res.success) {
        setSuccessMsg("Results draft saved successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      alert(err.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResults = async () => {
    if (winners.length === 0) {
      alert("Please declare at least one winner or participant position before publishing.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to officially PUBLISH the results? This will immediately update student co-curricular achievement profiles and generate verifiable JOY University certificates."
      )
    ) {
      return;
    }

    try {
      setPublishing(true);
      setSuccessMsg("");
      // Save winners first
      await api.post(`/results/events/${id}`, { winners, generalRemarks });
      // Publish
      const res = await api.post(`/results/events/${id}/publish`);
      if (res.success) {
        setIsPublished(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setSuccessMsg(
          "Results published! Certificates generated and student achievement profiles updated."
        );
        fetchEventAndResults();
      }
    } catch (err) {
      alert(err.message || "Failed to publish results.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/teacher/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assigned Events</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Declare Results: {event?.title || "Event"}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Award 1st, 2nd, and 3rd positions, publish podium rankings, and auto-issue credentials.
          </p>
        </div>

        {isPublished && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Officially Published</span>
          </span>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Winners Builder Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Winners & Podium Roster</h3>
            <p className="text-xs text-slate-500">
              Select student participants who won 1st, 2nd, 3rd, or merit citations.
            </p>
          </div>

          <button
            type="button"
            onClick={addWinnerRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Winner / Position</span>
          </button>
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 space-y-3">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
            <p>No winners declared yet. Click "Add Winner / Position" to select winners.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map((win, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Position #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeWinner(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Position selector */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Rank / Award</label>
                    <select
                      value={win.position}
                      onChange={(e) => updateWinner(idx, { position: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold"
                    >
                      {positionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student selector */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Student Participant</label>
                    <select
                      value={win.student}
                      onChange={(e) => updateWinner(idx, { student: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      {registrations.map((reg) => (
                        <option key={reg.student?._id} value={reg.student?._id}>
                          {reg.student?.name} ({reg.student?.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Score / Points */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Score / Grade</label>
                    <input
                      type="text"
                      placeholder="e.g. 95/100"
                      value={win.score || ""}
                      onChange={(e) => updateWinner(idx, { score: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  {/* Custom Title */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Citation Title (on Certificate)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Position — Best Innovation"
                      value={win.title || ""}
                      onChange={(e) => updateWinner(idx, { title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  {/* Team Name */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Team Name (if group)</label>
                    <input
                      type="text"
                      placeholder="e.g. Binary Beasts"
                      value={win.teamName || ""}
                      onChange={(e) => updateWinner(idx, { teamName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="sm:col-span-12 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Evaluation Remarks</label>
                    <input
                      type="text"
                      placeholder="Judge's commendation or notes..."
                      value={win.remarks || ""}
                      onChange={(e) => updateWinner(idx, { remarks: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* General Remarks */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">Official Jury Remarks & Summary</label>
          <textarea
            rows={2}
            value={generalRemarks}
            onChange={(e) => setGeneralRemarks(e.target.value)}
            placeholder="Summarize the event competition, jury observations, or congratulations message..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            disabled={saving || publishing}
            onClick={handleSaveDraft}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? "Saving Draft..." : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={saving || publishing}
            onClick={handlePublishResults}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{publishing ? "Publishing & Issuing Certs..." : "Publish Results & Issue Certificates"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
