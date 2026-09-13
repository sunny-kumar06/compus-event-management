import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Trophy, Calendar, Award, CheckCircle2 } from "lucide-react";

export default function StudentResults() {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [resultsData, setResultsData] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    const fetchCompletedEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events?status=completed&limit=50");
        if (res.success && res.data?.length > 0) {
          setCompletedEvents(res.data);
          setSelectedEventId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load completed events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedEvents();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedEventId) return;
      try {
        setResultsLoading(true);
        const res = await api.get(`/results/events/${selectedEventId}`);
        if (res.success) {
          setResultsData(res.data);
        }
      } catch (err) {
        console.error("Failed to load event results:", err);
        setResultsData(null);
      } finally {
        setResultsLoading(false);
      }
    };
    fetchResults();
  }, [selectedEventId]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Event Results & Winners Podium
        </h1>
        <p className="text-xs text-slate-500">
          Official competition results, winner positions, and commendations.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading events...</div>
      ) : completedEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
          No events have completed results declared yet. Check back following upcoming events.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event Picker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">Select Completed Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-semibold text-slate-800"
            >
              {completedEvents.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} ({new Date(e.eventDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Results Box */}
          {resultsLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading results...</div>
          ) : !resultsData || !resultsData.winners || resultsData.winners.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Results compilation is currently in progress for this event.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Results Published
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {completedEvents.find((e) => e._id === selectedEventId)?.title}
                </h3>
                {resultsData.generalRemarks && (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    "{resultsData.generalRemarks}"
                  </p>
                )}
              </div>

              {/* Winners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {resultsData.winners.map((win, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border text-center space-y-3 ${
                      win.position === "1st"
                        ? "bg-amber-50/70 border-amber-200"
                        : win.position === "2nd"
                        ? "bg-slate-50 border-slate-200"
                        : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <span className="text-4xl">
                      {win.position === "1st" ? "🥇" : win.position === "2nd" ? "🥈" : win.position === "3rd" ? "🥉" : "🎖️"}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{win.student?.name || "Participant"}</h4>
                      <p className="text-xs font-bold text-amber-900 mt-0.5">{win.title || win.position}</p>
                      {win.teamName && (
                        <p className="text-[11px] text-slate-500 font-semibold">{win.teamName}</p>
                      )}
                    </div>
                    {win.remarks && (
                      <p className="text-[11px] text-slate-600 italic bg-white/60 p-2 rounded-xl">
                        "{win.remarks}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
