import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useInstitution } from "../../context/InstitutionContext";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  QrCode,
  Trophy,
  Award,
  Bell,
  Settings,
  Users,
  GraduationCap,
  ShieldCheck,
  PlusCircle,
  FileCheck2,
  Sparkles,
  Layers
} from "lucide-react";

export default function Sidebar({ className = "" }) {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const { institution } = useInstitution();

  const studentLinks = [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/events", label: "Browse Events", icon: Calendar },
    { to: "/student/registrations", label: "My Registrations", icon: Ticket },
    { to: "/student/attendance", label: "Mark Attendance", icon: QrCode },
    { to: "/student/results", label: "Event Results", icon: Trophy },
    { to: "/student/certificates", label: "My Certificates", icon: Award },
    { to: "/student/achievements", label: "Achievement Profile", icon: Sparkles },
    { to: "/student/notifications", label: "Notifications", icon: Bell },
    { to: "/student/settings", label: "Profile & Settings", icon: Settings }
  ];

  const teacherLinks = [
    { to: "/teacher/dashboard", label: "Teacher Dashboard", icon: LayoutDashboard },
    { to: "/teacher/events", label: "Assigned Events", icon: Calendar },
    { to: "/teacher/profile", label: "Faculty Profile", icon: GraduationCap },
    { to: "/teacher/notifications", label: "Notifications", icon: Bell }
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Admin Analytics", icon: LayoutDashboard },
    { to: "/admin/events", label: "Event Management", icon: Calendar },
    { to: "/admin/events/create", label: "Create Event (Wizard)", icon: PlusCircle },
    { to: "/admin/students", label: "Manage Students", icon: Users },
    { to: "/admin/teachers", label: "Manage Faculty", icon: GraduationCap },
    { to: "/admin/certificates", label: "Certificates Registry", icon: Award },
    { to: "/admin/settings", label: "Institution Settings", icon: Settings },
    { to: "/admin/notifications", label: "Notifications", icon: Bell }
  ];

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  return (
    <aside className={`w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 ${className}`}>
      <div className="space-y-6">
        {/* Role Identity Card */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-base shadow-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                {user?.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {isAdmin ? "University Administration" : isTeacher ? "Faculty Workspace" : "Student Hub"}
          </div>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith("/dashboard")}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-900 text-white shadow-sm shadow-blue-900/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Institution Footer watermark */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-[11px] font-bold text-slate-700">{institution.name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Campus Event Hub v2.0</p>
      </div>
    </aside>
  );
}
