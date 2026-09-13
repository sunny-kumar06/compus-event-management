import React, { useState } from "react";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import { Settings, CheckCircle2, Shield, Palette, Building2, UserCheck, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const { institution, refreshSettings } = useInstitution();

  const [formData, setFormData] = useState({
    institutionName: institution.name || "JOY University",
    shortName: institution.shortName || "JOY University",
    productName: institution.productName || "Campus Event Hub",
    tagline: institution.tagline || "Smart Event Management for a Smarter Campus.",
    website: institution.website || "https://joy.edu",
    email: institution.email || "events@joy.edu",
    phone: institution.phone || "+91 98765 43210",
    address: institution.address || "JOY Knowledge City, Academic Ridge, Campus Drive, PIN 560001",
    primaryColor: institution.theme?.primaryColor || "#1e3a8a",
    secondaryColor: institution.theme?.secondaryColor || "#4338ca",
    accentColor: institution.theme?.accentColor || "#059669",
    footerText: institution.footerText || "© 2026 JOY University — Campus Event Hub. All rights reserved.",
    certificateSigners: institution.certificateSigners || [
      { name: "Dr. K. S. Ramanathan", title: "Dean of Student Affairs", institution: "JOY University" },
      { name: "Prof. Anjali Deshmukh", title: "Director, Campus Events Council", institution: "JOY University" }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignerChange = (idx, field, value) => {
    const updated = [...formData.certificateSigners];
    updated[idx] = { ...updated[idx], [field]: value };
    handleChange("certificateSigners", updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess(false);
      const res = await api.put("/settings", formData);
      if (res.success) {
        await refreshSettings();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      }
    } catch (err) {
      alert(err.message || "Failed to update institution settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToJoyDefaults = () => {
    setFormData({
      institutionName: "JOY University",
      shortName: "JOY University",
      productName: "Campus Event Hub",
      tagline: "Smart Event Management for a Smarter Campus.",
      website: "https://joy.edu",
      email: "events@joy.edu",
      phone: "+91 98765 43210",
      address: "JOY Knowledge City, Academic Ridge, Campus Drive, PIN 560001",
      primaryColor: "#1e3a8a",
      secondaryColor: "#4338ca",
      accentColor: "#059669",
      footerText: "© 2026 JOY University — Campus Event Hub. All rights reserved.",
      certificateSigners: [
        { name: "Dr. K. S. Ramanathan", title: "Dean of Student Affairs", institution: "JOY University" },
        { name: "Prof. Anjali Deshmukh", title: "Director, Campus Events Council", institution: "JOY University" }
      ]
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-900" />
            <span>Institution Branding & Boilerplate Settings</span>
          </h1>
          <p className="text-xs text-slate-500">
            Control the college name, product branding, theme colors, and certificate signatories dynamically.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToJoyDefaults}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to JOY University Defaults</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Institution branding and boilerplate settings saved! Application UI updated dynamically.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institution Identity */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-900" />
            <span>Institution & Product Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Institution Name</label>
              <input
                type="text"
                required
                value={formData.institutionName}
                onChange={(e) => handleChange("institutionName", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Short Name</label>
              <input
                type="text"
                required
                value={formData.shortName}
                onChange={(e) => handleChange("shortName", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Product Name</label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Product Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Address Coordinates */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-900" />
            <span>Contact & Address Coordinates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Official Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700">Campus Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Theme Colors */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="w-4 h-4 text-purple-700" />
            <span>Theme Colors & Academic Palette</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Authorized Certificate Signatories */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Authorized Certificate Signatories</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(formData.certificateSigners || []).map((signer, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Signatory #{idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="Signer Name"
                  value={signer.name}
                  onChange={(e) => handleSignerChange(idx, "name", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                />
                <input
                  type="text"
                  placeholder="Signer Title"
                  value={signer.title}
                  onChange={(e) => handleSignerChange(idx, "title", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {saving ? "Saving Configuration..." : "Save & Apply Institution Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
