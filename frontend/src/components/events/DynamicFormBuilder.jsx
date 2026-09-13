import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Eye, Settings2 } from "lucide-react";
import DynamicFormRenderer from "./DynamicFormRenderer";

export default function DynamicFormBuilder({ schema = [], onChange }) {
  const [activeTab, setActiveTab] = useState("builder"); // 'builder' or 'preview'
  const [previewData, setPreviewData] = useState({});

  const fieldTypes = [
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text / Paragraph" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone Number" },
    { value: "dropdown", label: "Dropdown Select" },
    { value: "radio", label: "Single Choice (Radio)" },
    { value: "checkbox", label: "Multiple Choice (Checkbox)" },
    { value: "date", label: "Date Picker" },
    { value: "team_name", label: "Team Name" },
    { value: "team_members", label: "Team Members List" },
    { value: "url", label: "Website / GitHub / Drive URL" },
    { value: "file", label: "File Link Submission" }
  ];

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: `Custom Field ${schema.length + 1}`,
      type: "text",
      required: false,
      placeholder: "",
      options: ["Option 1", "Option 2"],
      order: schema.length + 1
    };
    onChange([...schema, newField]);
  };

  const updateField = (index, updates) => {
    const updated = [...schema];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeField = (index) => {
    const updated = schema.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleOptionsChange = (index, optionsString) => {
    const options = optionsString.split(",").map((s) => s.trim()).filter(Boolean);
    updateField(index, { options });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      {/* Tab switch */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-900" />
            <span>Dynamic Registration Form Builder</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Create customized registration questions specific to this event.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "builder" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Builder ({schema.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "preview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="space-y-4">
          {schema.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-500 mb-3 font-medium">
                No custom fields added yet. Default student information (Roll No, Dept, Semester) will be captured.
              </p>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Question</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {schema.map((field, idx) => (
                <div
                  key={field.id || idx}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Question #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Field Label */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Question / Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        placeholder="e.g. GitHub URL or Team Name"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Field Type */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(idx, { type: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                      >
                        {fieldTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Required Toggle */}
                    <div className="sm:col-span-2 flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(idx, { required: e.target.checked })}
                          className="rounded text-blue-900 focus:ring-blue-500"
                        />
                        <span>Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Options (for Dropdown, Radio, Checkbox) */}
                  {["dropdown", "radio", "checkbox"].includes(field.type) && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Options (comma-separated list)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(", ")}
                        onChange={(e) => handleOptionsChange(idx, e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  )}

                  {/* Placeholder */}
                  {!["radio", "checkbox"].includes(field.type) && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Placeholder hint (optional)</label>
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                        placeholder="Hint for student..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addField}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-900 flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-blue-50/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Field</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="mb-4 pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800">Preview: How students see your form</span>
          </div>
          <DynamicFormRenderer
            schema={schema}
            formData={previewData}
            onChange={setPreviewData}
          />
        </div>
      )}
    </div>
  );
}
