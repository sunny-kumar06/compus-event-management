import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import { Bell, CheckCheck, ExternalLink, Calendar, Ticket, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Announcements
          </h1>
          <p className="text-xs text-slate-500">
            Real-time alerts regarding event registrations, attendance records, and certificates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm divide-y divide-slate-100">
        {loading && notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Bell className="w-10 h-10 mx-auto text-slate-200 mb-2" />
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? "bg-blue-50/40 -mx-6 px-6 py-4" : ""
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => markAsRead(n._id)}
                    className="p-1.5 text-slate-400 hover:text-blue-900 transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="text-[11px] text-blue-900 hover:underline font-bold"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
