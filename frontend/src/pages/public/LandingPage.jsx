import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import { useAuth } from "../../context/AuthContext";
import EventCard from "../../components/events/EventCard";
import DemoCredentialsModal from "../../components/common/DemoCredentialsModal";
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  QrCode,
  Award,
  ArrowRight,
  CheckCircle2,
  Users,
  Trophy,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const { institution } = useInstitution();
  const { user, login } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events?limit=3&status=registration_open");
        if (res.success) {
          setUpcomingEvents(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load landing events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDemoLogin = async (email, password) => {
    try {
      await login(email, password);
      window.location.href = "/student/dashboard";
    } catch (err) {
      alert(err.message || "Demo login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Academic geometric grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Institutional Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-bold tracking-wide backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Official Portal — {institution.name}</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans">
              {institution.name}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                {institution.productName}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              "{institution.tagline || "Smart Event Management for a Smarter Campus."}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-lg shadow-white/10 transition-all hover:scale-105"
            >
              <Calendar className="w-4 h-4 text-blue-900" />
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            {user ? (
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
              >
                <span>Go to Dashboard ({user.role})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 border border-blue-700/60 transition-all"
              >
                <span>Student Login</span>
              </Link>
            )}

            <Link
              to="/verify-certificate/JOY-CERT-2026-000101"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Certificate</span>
            </Link>
          </div>

          {/* Demo Credentials Quick Box */}
          <div className="pt-8 max-w-2xl mx-auto text-left">
            <DemoCredentialsModal onSelectCredential={handleDemoLogin} />
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Campus Life in Action</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Upcoming Events
            </h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 hover:gap-2 transition-all"
          >
            <span>Browse All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
            No events currently scheduled. Check back soon!
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Seamless Student Journey
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Campus Event Hub Works
            </h3>
            <p className="text-xs text-slate-500">
              One unified digital workflow from event discovery to verifiable certificate issuance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discover Events",
                desc: "Browse technical fests, hackathons, sports championships and cultural galas.",
                icon: Calendar,
                color: "bg-blue-50 text-blue-700"
              },
              {
                step: "02",
                title: "Register with Ease",
                desc: "Submit team details and custom dynamic questions. Get your unique JOY-EVT ID instantly.",
                icon: CheckCircle2,
                color: "bg-indigo-50 text-indigo-700"
              },
              {
                step: "03",
                title: "Scan Rotating QR",
                desc: "Mark live verified attendance inside the venue using your smartphone camera.",
                icon: QrCode,
                color: "bg-emerald-50 text-emerald-700"
              },
              {
                step: "04",
                title: "Earn Credentials",
                desc: "Win positions, build your digital co-curricular profile, and download tamper-proof certificates.",
                icon: Award,
                color: "bg-amber-50 text-amber-700"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200/70 relative space-y-4 hover:shadow-lg transition-all"
                >
                  <span className="text-3xl font-black text-slate-300 tracking-tighter block font-mono">
                    {item.step}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Architectural Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Built for {institution.name}
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Enterprise-Grade College Event Management Architecture
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed as a robust, production-ready university boilerplate. Features role-based access control, dynamic form schema generation, 30-second rotating QR attendance tokens to prevent screenshot cheating, and public certificate verification.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Strict multi-role authorization (Admin, Faculty, Student)",
                "Dynamic drag-and-drop registration form builder",
                "Rotating time-window HMAC QR attendance engine",
                "Automated co-curricular achievement transcript tracking",
                "Cryptographically verifiable PDF certificate generation"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-md"
              >
                <span>Get Started with JOY University</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Feature Showcase Card */}
          <div className="p-8 bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">joy.edu/security-matrix</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-emerald-400">✓ Institution:</span> {institution.name}
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-blue-400">✓ Rotating QR Token:</span> HMAC-SHA256 (30s window expiry)
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-amber-400">✓ ID Format:</span> {institution.name.substring(0, 3).toUpperCase()}-EVT-2026-XXXXXX
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-purple-400">✓ Certificate Registry:</span> Public SHA256 integrity check
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
