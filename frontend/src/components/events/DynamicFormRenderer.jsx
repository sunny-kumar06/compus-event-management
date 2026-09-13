import React from "react";

export default function DynamicFormRenderer({ schema = [], formData = {}, onChange, errors = {} }) {
  if (!schema || schema.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200">
        Standard registration fields apply (Name, Roll Number, Department, Year). No extra event-specific questions.
      </div>
    );
  }

  // Sort fields by order
  const sortedSchema = [...schema].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleInputChange = (fieldId, value) => {
    onChange({
      ...formData,
      [fieldId]: value
    });
  };

  const handleCheckboxChange = (fieldId, option, isChecked) => {
    const currentValues = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
    let updated;
    if (isChecked) {
      updated = [...currentValues, option];
    } else {
      updated = currentValues.filter((v) => v !== option);
    }
    handleInputChange(fieldId, updated);
  };

  return (
    <div className="space-y-4">
      {sortedSchema.map((field) => {
        const error = errors[field.id];
        const value = formData[field.id] !== undefined ? formData[field.id] : "";

        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {field.label}
              {field.required && <span className="text-rose-500 ml-1">*</span>}
            </label>

            {/* Render input based on field type */}
            {field.type === "text" || field.type === "team_name" ? (
              <input
                type="text"
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "textarea" || field.type === "team_members" ? (
              <textarea
                rows={3}
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "number" ? (
              <input
                type="number"
                placeholder={field.placeholder || "0"}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "email" ? (
              <input
                type="email"
                placeholder={field.placeholder || "name@joy.edu"}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "phone" ? (
              <input
                type="tel"
                placeholder={field.placeholder || "+91 98765 43210"}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "url" ? (
              <input
                type="url"
                placeholder={field.placeholder || "https://..."}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "date" ? (
              <input
                type="date"
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            ) : field.type === "dropdown" ? (
              <select
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
                  error ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              >
                <option value="">-- Select an option --</option>
                {(field.options || []).map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "radio" ? (
              <div className="space-y-1.5 pt-1">
                {(field.options || []).map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      checked={value === opt}
                      onChange={() => handleInputChange(field.id, opt)}
                      className="text-blue-900 focus:ring-blue-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : field.type === "checkbox" ? (
              <div className="space-y-1.5 pt-1">
                {(field.options || []).map((opt, i) => {
                  const checked = Array.isArray(value) && value.includes(opt);
                  return (
                    <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                        className="rounded text-blue-900 focus:ring-blue-500"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : field.type === "file" ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-center text-slate-500">
                <input
                  type="text"
                  placeholder="Paste URL or cloud link to your file / drive..."
                  value={value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            ) : null}

            {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
