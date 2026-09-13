import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useInstitution } from "../../context/InstitutionContext";
import { CategoryBadge, StatusBadge } from "../../components/common/Badge";
import DynamicFormRenderer from "../../components/events/DynamicFormRenderer";
import Modal from "../../components/common/Modal";
import confetti from "canvas-confetti";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  FileText,
  Share2,
  Sparkles,
  ArrowLeft
} from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();
  const { institution } = useInstitution();

  const [event, setEvent] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [customFormData, setCustomFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.success) {
        setEvent(res.data);
        setUserRegistration(res.userRegistration);
      }
    } catch (err) {
      setError(err.message || "Failed to load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegisterClick = () => {
    if (!user) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }
    if (!isStudent) {
      alert("Faculty and Admins cannot register as student participants.");
      return;
    }
    setIsRegisterModalOpen(true);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side validation of required dynamic form schema fields
    const errors = {};
    if (event.dynamicFormSchema) {
      for (const field of event.dynamicFormSchema) {
        if (field.required) {
          const val = customFormData[field.id];
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            errors[field.id] = `${field.label} is required.`;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/registrations/events/${event._id}/register`, {
        customFormData
      });

      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        setRegSuccessData(res.data);
        setUserRegistration(res.data);
        fetchEvent();
      }
    } catch (err) {
      alert(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Event Not Found</h2>
          <p className="text-xs text-slate-500">{error || "The requested event does not exist."}</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const deadlineDate = new Date(event.regDeadline);
  const isDeadlinePassed = new Date() > deadlineDate;
  const isCapacityFull = event.maxCapacity && event.currentRegistrationsCount >= event.maxCapacity;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation back */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Directory</span>
        </Link>

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800">
          <div className="h-72 sm:h-96 w-full relative">
            <img
              src={event.banner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"}
              alt={event.title}
              className="w-full h-full object-cover object-center brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={event.category} />
              <StatusBadge status={event.status} />
              <span className="text-xs font-mono bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                {institution.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Description & Agenda */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>About the Event</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Rules & Guidelines */}
            {event.rules && event.rules.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Rules & Eligibility</span>
                </h3>
                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs font-semibold text-blue-900">
                  Eligibility: {event.eligibility}
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coordinators Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-900" />
                <span>Event Coordinators</span>
              </h3>

              {/* Faculty Coordinators (1, 2, or more) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Faculty Coordinators ({event.facultyCoordinators?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(event.facultyCoordinators || []).map((teacher) => (
                    <div
                      key={teacher._id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{teacher.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{teacher.email}</p>
                        <span className="text-[10px] font-bold text-blue-900">Faculty Coordinator</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Coordinators */}
              {event.studentCoordinators && event.studentCoordinators.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Student Coordinators ({event.studentCoordinators.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.studentCoordinators.map((sc) => (
                      <div
                        key={sc._id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                          {sc.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{sc.name}</p>
                          <span className="text-[10px] font-bold text-emerald-700">Student Coordinator</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Key Schedule & Registration Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
              <h3 className="text-base font-bold text-slate-900">Event Details</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-medium">Event Date</span>
                    <span className="font-bold text-slate-800">
                      {eventDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-medium">Timing</span>
                    <span className="font-bold text-slate-800">{event.startTime} — {event.endTime}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-medium">Venue Location</span>
                    <span className="font-bold text-slate-800">{event.venue}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-medium">Capacity & Enrolled</span>
                    <span className="font-bold text-slate-800">
                      {event.currentRegistrationsCount || 0} Registered of {event.maxCapacity || "Unlimited"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[11px] uppercase tracking-wider">Registration Deadline:</span>
                  <span className="font-semibold text-xs">
                    {deadlineDate.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Dynamic Registration Status & Trigger */}
              <div className="pt-4 border-t border-slate-100">
                {userRegistration ? (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <h4 className="text-xs font-bold text-emerald-900">You Are Registered!</h4>
                    <p className="text-[11px] text-emerald-700">
                      Registration ID: <strong className="font-mono">{userRegistration.registrationId}</strong>
                    </p>
                    <Link
                      to="/student/registrations"
                      className="block mt-2 text-xs font-bold text-emerald-900 underline"
                    >
                      View Registration Slip
                    </Link>
                  </div>
                ) : event.status === "completed" ? (
                  <div className="p-4 bg-slate-100 rounded-2xl text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700">Event Completed</span>
                    <p className="text-[11px] text-slate-500">Results and certificates have been declared.</p>
                    <Link
                      to="/student/results"
                      className="block py-2 text-xs font-bold text-white bg-blue-900 rounded-xl"
                    >
                      View Results
                    </Link>
                  </div>
                ) : isDeadlinePassed ? (
                  <button
                    disabled
                    className="w-full py-3 text-xs font-bold text-slate-400 bg-slate-100 rounded-2xl cursor-not-allowed"
                  >
                    Registration Closed (Deadline Passed)
                  </button>
                ) : isCapacityFull ? (
                  <button
                    disabled
                    className="w-full py-3 text-xs font-bold text-amber-700 bg-amber-50 rounded-2xl cursor-not-allowed border border-amber-200"
                  >
                    Event Capacity Full
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="w-full py-3.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-lg shadow-blue-900/20 rounded-2xl transition-all hover:scale-[1.02]"
                  >
                    {user ? "Register for this Event" : "Login as Student to Register"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setRegSuccessData(null);
        }}
        title={`Register: ${event.title}`}
        maxWidth="max-w-lg"
      >
        {regSuccessData ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Registration Confirmed!</h3>
            <p className="text-xs text-slate-600">
              You have successfully registered for {event.title}.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Official Registration ID</span>
              <span className="font-mono text-base font-bold text-blue-900">
                {regSuccessData.registrationId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Keep this Registration ID handy for entering the venue and verifying your QR attendance.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  navigate("/student/registrations");
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm transition-all"
              >
                Go to My Registrations
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">{user?.name}</div>
              <div className="text-slate-500 font-mono">{user?.email}</div>
            </div>

            {/* Dynamic Form Questions */}
            <div className="space-y-4">
              <DynamicFormRenderer
                schema={event.dynamicFormSchema}
                formData={customFormData}
                onChange={setCustomFormData}
                errors={formErrors}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-md rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting Registration..." : "Confirm Registration"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
