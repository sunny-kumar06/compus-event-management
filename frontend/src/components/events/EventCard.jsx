import React from "react";
import { Link } from "react-router-dom";
import { CategoryBadge, StatusBadge } from "../common/Badge";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";

export default function EventCard({ event, userRegistration = null, className = "" }) {
  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();
  const isFull = event.maxCapacity && event.currentRegistrationsCount >= event.maxCapacity;

  const getActionButton = () => {
    if (userRegistration) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Registered
        </span>
      );
    }
    if (event.status === "completed") {
      return (
        <Link
          to={`/events/${event._id}`}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>View Results</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      );
    }
    if (event.status === "cancelled") {
      return (
        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50">
          Cancelled
        </span>
      );
    }
    if (isFull) {
      return (
        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50">
          Full Capacity
        </span>
      );
    }
    return (
      <Link
        to={`/events/${event._id}`}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-sm transition-all group-hover:gap-2"
      >
        <span>Details & Register</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    );
  };

  const capacityPercent = event.maxCapacity
    ? Math.min(100, Math.round((event.currentRegistrationsCount / event.maxCapacity) * 100))
    : 0;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group ${className}`}>
      {/* Banner Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={event.banner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"}
          alt={event.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4">
          <CategoryBadge category={event.category} />
        </div>

        {/* Floating Status Badge */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={event.status} />
        </div>

        {/* Date Pill */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-xs font-semibold drop-shadow-md">
          <Calendar className="w-4 h-4 text-blue-300" />
          <span>{eventDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* Event Details Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/events/${event._id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.startTime} — {event.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity Bar & Action */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>Registered: {event.currentRegistrationsCount || 0} / {event.maxCapacity || "∞"}</span>
            </span>
            <span>{capacityPercent}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPercent >= 90 ? "bg-rose-500" : capacityPercent >= 70 ? "bg-amber-500" : "bg-blue-600"
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              JOY University
            </span>
            {getActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
