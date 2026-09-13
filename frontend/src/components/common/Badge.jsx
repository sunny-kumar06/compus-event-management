import React from "react";

export function StatusBadge({ status }) {
  const statusStyles = {
    published: "bg-blue-50 text-blue-700 border-blue-200",
    registration_open: "bg-emerald-50 text-emerald-700 border-emerald-200",
    registration_closed: "bg-amber-50 text-amber-700 border-amber-200",
    ongoing: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-slate-100 text-slate-700 border-slate-300",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    draft: "bg-gray-100 text-gray-600 border-gray-200",

    // Registration statuses
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",

    // Attendance statuses
    present: "bg-emerald-50 text-emerald-700 border-emerald-200",
    late: "bg-amber-50 text-amber-700 border-amber-200",
    absent: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const labels = {
    published: "Published",
    registration_open: "Open for Registration",
    registration_closed: "Registration Closed",
    ongoing: "Event in Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    draft: "Draft",
    confirmed: "Confirmed",
    pending: "Pending Approval",
    rejected: "Rejected",
    present: "Present",
    late: "Late",
    absent: "Absent"
  };

  const style = statusStyles[status?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200";
  const label = labels[status?.toLowerCase()] || status || "Unknown";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const categoryStyles = {
    technical: "bg-sky-50 text-sky-800 border-sky-200",
    cultural: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
    sports: "bg-emerald-50 text-emerald-800 border-emerald-200",
    workshops: "bg-amber-50 text-amber-800 border-amber-200",
    seminars: "bg-indigo-50 text-indigo-800 border-indigo-200",
    competitions: "bg-rose-50 text-rose-800 border-rose-200",
    club: "bg-teal-50 text-teal-800 border-teal-200"
  };

  const style = categoryStyles[category?.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize border ${style}`}>
      {category}
    </span>
  );
}
