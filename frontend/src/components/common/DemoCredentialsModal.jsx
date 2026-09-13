import React from "react";
import { KeyRound, Shield, GraduationCap, UserCheck, Sparkles } from "lucide-react";

export default function DemoCredentialsModal({ onSelectCredential, className = "" }) {
  const accounts = [
    {
      role: "ADMIN",
      name: "JOY Admin",
      email: "admin@joy.edu",
      pass: "Admin@123",
      icon: Shield,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      desc: "Full campus management, event approvals, settings, and analytics"
    },
    {
      role: "FACULTY",
      name: "Dr. Rajesh Sharma",
      email: "sharma@joy.edu",
      pass: "Faculty@123",
      icon: UserCheck,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      desc: "Assigned event coordinator, live rotating QR attendance, results declaration"
    },
    {
      role: "STUDENT",
      name: "Sunny Kumar (1st Place Winner)",
      email: "sunny@joy.edu",
      pass: "Student@123",
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Event registration, QR attendance scan, results & certificates portfolio"
    },
    {
      role: "STUDENT",
      name: "Aman Sharma (Participant/Runner Up)",
      email: "aman@joy.edu",
      pass: "Student@123",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Explore upcoming events, dynamic registration forms, and achievements"
    }
  ];

  return (
    <div className={`p-4 bg-slate-50/80 rounded-2xl border border-slate-200 ${className}`}>
      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>1-Click Demo Credentials for Evaluators</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {accounts.map((acc, idx) => {
          const Icon = acc.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectCredential(acc.email, acc.pass)}
              className="flex items-start gap-3 p-3 text-left bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <div className={`p-2 rounded-lg border ${acc.color} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {acc.name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {acc.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">{acc.email}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{acc.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
