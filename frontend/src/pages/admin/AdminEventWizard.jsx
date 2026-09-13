import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import DynamicFormBuilder from "../../components/events/DynamicFormBuilder";
import EventCard from "../../components/events/EventCard";
import confetti from "canvas-confetti";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Save,
  Layers,
  Settings2
} from "lucide-react";

export default function AdminEventWizard() {
  const navigate = useNavigate();
  const { categories, institution } = useInstitution();

  const [currentStep, setCurrentStep] = useState(1);
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [eventData, setEventData] = useState({
    // Step 1: Basic
    title: "",
    category: "technical",
    description: "",
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",

    // Step 2: Date & Venue
    eventDate: "",
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    venue: "Main Auditorium, Academic Block",

    // Step 3: Registration Settings
    regStartDate: new Date().toISOString().split("T")[0],
    regDeadline: "",
    maxCapacity: 100,
    eligibility: "Open to all JOY University Students",
    rules: "1. College ID Card is required.\n2. Respect campus discipline codes.",

    // Step 4: Dynamic Form Schema
    dynamicFormSchema: [],

    // Step 5: Faculty Coordinators (multi-select IDs)
    facultyCoordinators: [],

    // Step 6: Student Coordinators (multi-select IDs)
    studentCoordinators: [],

    // Status
    status: "published"
  });

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        setLoadingUsers(true);
        const [teacherRes, studentRes] = await Promise.all([
          api.get("/teachers?limit=100"),
          api.get("/students?limit=100")
        ]);
        if (teacherRes.success) setTeachersList(teacherRes.data || []);
        if (studentRes.success) setStudentsList(studentRes.data || []);
      } catch (err) {
        console.error("Failed to load users for assignment:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchCoordinators();
  }, []);

  const handleChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacultyToggle = (teacherUserId) => {
    const current = eventData.facultyCoordinators;
    if (current.includes(teacherUserId)) {
      handleChange("facultyCoordinators", current.filter((id) => id !== teacherUserId));
    } else {
      handleChange("facultyCoordinators", [...current, teacherUserId]);
    }
  };

  const handleStudentToggle = (studentUserId) => {
    const current = eventData.studentCoordinators;
    if (current.includes(studentUserId)) {
      handleChange("studentCoordinators", current.filter((id) => id !== studentUserId));
    } else {
      handleChange("studentCoordinators", [...current, studentUserId]);
    }
  };

  const handleSubmitEvent = async (statusOverride = null) => {
    const finalStatus = statusOverride || eventData.status;

    if (!eventData.title.trim() || !eventData.eventDate || !eventData.regDeadline) {
      alert("Please ensure Event Title, Event Date, and Registration Deadline are specified.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/events", {
        ...eventData,
        status: finalStatus,
        rules: typeof eventData.rules === "string" ? eventData.rules.split("\n").filter(Boolean) : eventData.rules
      });

      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        navigate("/admin/events");
      }
    } catch (err) {
      alert(err.message || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Date & Venue" },
    { num: 3, label: "Registration" },
    { num: 4, label: "Dynamic Form" },
    { num: 5, label: "Faculty Coordinators" },
    { num: 6, label: "Student Coordinators" },
    { num: 7, label: "Live Preview" },
    { num: 8, label: "Publish" }
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Wizard Step Progress Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              8-Step Event Creator
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {steps[currentStep - 1].label} (Step {currentStep} of 8)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmitEvent("draft")}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {steps.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`p-2 text-center rounded-xl transition-all ${
                currentStep === s.num
                  ? "bg-blue-900 text-white shadow-sm font-bold"
                  : currentStep > s.num
                  ? "bg-blue-50 text-blue-900 font-semibold"
                  : "bg-slate-100 text-slate-400 font-medium"
              }`}
            >
              <span className="block text-[10px] font-mono">0{s.num}</span>
              <span className="block text-[11px] truncate">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wizard Step Body */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 1: Event Identity</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Event Title *</label>
              <input
                type="text"
                required
                value={eventData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. JOY Tech Fest 2026: 36-Hour Hackathon"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category *</label>
                <select
                  value={eventData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {categories.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Banner Image URL</label>
                <input
                  type="text"
                  value={eventData.banner}
                  onChange={(e) => handleChange("banner", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Detailed Description *</label>
              <textarea
                rows={4}
                required
                value={eventData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Outline the event theme, objectives, schedules, and perks..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Date & Venue */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 2: Date & Campus Venue</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Event Date *</label>
                <input
                  type="date"
                  required
                  value={eventData.eventDate}
                  onChange={(e) => handleChange("eventDate", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Start Time</label>
                <input
                  type="text"
                  value={eventData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">End Time</label>
                <input
                  type="text"
                  value={eventData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  placeholder="06:00 PM"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Campus Venue Location *</label>
              <input
                type="text"
                required
                value={eventData.venue}
                onChange={(e) => handleChange("venue", e.target.value)}
                placeholder="e.g. Main Auditorium, Tech Tower Lab 3"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Registration Settings */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 3: Registration Policy & Rules</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Registration Deadline *</label>
                <input
                  type="date"
                  required
                  value={eventData.regDeadline}
                  onChange={(e) => handleChange("regDeadline", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Maximum Participant Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={eventData.maxCapacity}
                  onChange={(e) => handleChange("maxCapacity", Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eligibility Criteria</label>
              <input
                type="text"
                value={eventData.eligibility}
                onChange={(e) => handleChange("eligibility", e.target.value)}
                placeholder="e.g. All JOY University undergraduate engineering students"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Event Rules & Guidelines (one per line)</label>
              <textarea
                rows={3}
                value={eventData.rules}
                onChange={(e) => handleChange("rules", e.target.value)}
                placeholder="1. Teams must bring laptops.\n2. College ID required."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Dynamic Form Builder */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 4: Dynamic Registration Questions</h3>
            <DynamicFormBuilder
              schema={eventData.dynamicFormSchema}
              onChange={(newSchema) => handleChange("dynamicFormSchema", newSchema)}
            />
          </div>
        )}

        {/* STEP 5: Faculty Coordinators Assignment */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 5: Faculty Coordinator Assignment</h3>
                <p className="text-xs text-slate-500">
                  Assign one, two, or multiple faculty members to coordinate this event.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-900 rounded-full border border-blue-200">
                {eventData.facultyCoordinators.length} Assigned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              {teachersList.map((t) => {
                const isChecked = eventData.facultyCoordinators.includes(t.user?._id);
                return (
                  <label
                    key={t.user?._id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-blue-50/70 border-blue-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleFacultyToggle(t.user?._id)}
                      className="rounded text-blue-900 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{t.user?.name}</p>
                      <p className="text-[11px] text-slate-500">{t.department}</p>
                      <span className="text-[10px] font-mono text-slate-400">{t.employeeId}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Student Coordinator Assignment */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 6: Student Coordinator Assignment</h3>
                <p className="text-xs text-slate-500">
                  Assign student volunteers and club leads to facilitate operations.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-900 rounded-full border border-emerald-200">
                {eventData.studentCoordinators.length} Assigned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              {studentsList.slice(0, 15).map((s) => {
                const isChecked = eventData.studentCoordinators.includes(s.user?._id);
                return (
                  <label
                    key={s.user?._id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-emerald-50/70 border-emerald-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleStudentToggle(s.user?._id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{s.user?.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{s.rollNumber}</p>
                      <span className="text-[10px] text-slate-400">{s.department}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Live Preview */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 7: Event Preview</h3>
              <p className="text-xs text-slate-500">
                Check how the event card and details will appear on the public portal.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <EventCard
                event={{
                  ...eventData,
                  currentRegistrationsCount: 0,
                  eventDate: eventData.eventDate || new Date()
                }}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p><strong>Dynamic Form Fields:</strong> {eventData.dynamicFormSchema.length} questions configured</p>
              <p><strong>Faculty Coordinators:</strong> {eventData.facultyCoordinators.length} professors assigned</p>
              <p><strong>Student Coordinators:</strong> {eventData.studentCoordinators.length} students assigned</p>
            </div>
          </div>
        )}

        {/* STEP 8: Publish */}
        {currentStep === 8 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-900 text-white font-bold flex items-center justify-center mx-auto text-2xl shadow-lg">
              🚀
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Ready to Publish Event!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once published, students across {institution.name} can discover the event and submit registrations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitEvent("draft")}
                className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitEvent("published")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{submitting ? "Publishing Event..." : "Publish Event Now"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep <= 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
              className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-sm"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
