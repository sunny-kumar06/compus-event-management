import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useInstitution } from "../../context/InstitutionContext";
import { Trophy, Award, Sparkles, Calendar, ShieldCheck, Printer } from "lucide-react";

export default function StudentAchievements() {
  const { user } = useAuth();
  const { institution } = useInstitution();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/students/${user._id}`);
        if (res.success) {
          setProfileData(res);
        }
      } catch (err) {
        console.error("Failed to load achievement profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchProfile();
  }, [user]);

  const profile = profileData?.profile || user?.profile;
  const stats = profileData?.stats || {
    eventsParticipated: 0,
    certificatesCount: 0,
    firstPositions: 0,
    secondPositions: 0,
    thirdPositions: 0
  };

  return (
    <div className="space-y-6">
      {/* Header with Print Transcript */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Achievement Profile
          </h1>
          <p className="text-xs text-slate-500">
            Official digital co-curricular transcript and verified laurels portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-all shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Official Transcript</span>
        </button>
      </div>

      {/* Official Co-Curricular Transcript Card */}
      <div className="printable-certificate bg-white rounded-3xl border-2 border-slate-200/90 p-6 sm:p-10 shadow-lg space-y-8">
        {/* Transcript Header */}
        <div className="border-b-2 border-slate-900/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-900">
                {institution.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-900" />
              <span className="text-xs font-bold text-slate-500">Office of Student Affairs</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-serif">
              Co-Curricular Honors & Achievements
            </h2>
            <p className="text-xs text-slate-400">Digital Student Verification Transcript</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left sm:text-right text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Enrollment Roll No
            </span>
            <span className="font-mono font-bold text-base text-blue-950">
              {profile?.rollNumber || "JOY-STUDENT"}
            </span>
          </div>
        </div>

        {/* Student Biographical Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Student Name:</span>
            <span className="font-bold text-slate-900 text-sm">{user?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Department:</span>
            <span className="font-semibold text-slate-800">{profile?.department || "CSE"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Academic Year:</span>
            <span className="font-semibold text-slate-800 capitalize">
              {profile?.academicYear?.replace("_", " ") || "Undergraduate"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Current Semester:</span>
            <span className="font-semibold text-slate-800">Semester {profile?.semester || 1}</span>
          </div>
        </div>

        {/* Aggregate Honors Table */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
              Events
            </span>
            <span className="text-2xl font-extrabold text-blue-950">{stats.eventsParticipated}</span>
            <span className="text-[10px] text-blue-700/80 block mt-1">Participated</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
              1st Position
            </span>
            <span className="text-2xl font-extrabold text-amber-950">🥇 {stats.firstPositions}</span>
            <span className="text-[10px] text-amber-700/80 block mt-1">Gold Medals</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
              2nd Position
            </span>
            <span className="text-2xl font-extrabold text-purple-950">🥈 {stats.secondPositions}</span>
            <span className="text-[10px] text-purple-700/80 block mt-1">Silver Runner Ups</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
              3rd Position
            </span>
            <span className="text-2xl font-extrabold text-rose-950">🥉 {stats.thirdPositions}</span>
            <span className="text-[10px] text-rose-700/80 block mt-1">Bronze Podiums</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
              Certificates
            </span>
            <span className="text-2xl font-extrabold text-emerald-950">{stats.certificatesCount}</span>
            <span className="text-[10px] text-emerald-700/80 block mt-1">Issued & Verified</span>
          </div>
        </div>

        {/* Chronological Achievement Timeline */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Official Event Honors Ledger</span>
          </h3>

          <div className="space-y-3">
            {profileData?.achievements?.length > 0 ? (
              profileData.achievements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {item.position === "1st" ? "🥇" : item.position === "2nd" ? "🥈" : "🥉"}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.eventTitle}</h4>
                      <p className="text-xs font-bold text-amber-800">{item.title}</p>
                      {item.remarks && <p className="text-[11px] text-slate-500 italic mt-0.5">"{item.remarks}"</p>}
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs shrink-0">
                    <span className="font-semibold text-slate-700 block">
                      {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      Verified Institution Record
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                No podium finishes recorded yet. All verified victories and special mentions appear here automatically upon result publication.
              </div>
            )}
          </div>
        </div>

        {/* Footer Verification Notice */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digitally authenticated co-curricular transcript by {institution.name}.</span>
          </div>
          <span>Date Generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
