import React from "react";
import { useInstitution } from "../../context/InstitutionContext";

export default function InstitutionLogo({ size = "md", showTagline = false, className = "" }) {
  const { institution } = useInstitution();

  const sizeClasses = {
    sm: { icon: "w-7 h-7", text: "text-base", sub: "text-[10px]" },
    md: { icon: "w-9 h-9", text: "text-lg", sub: "text-xs" },
    lg: { icon: "w-12 h-12", text: "text-2xl", sub: "text-sm" }
  }[size] || { icon: "w-9 h-9", text: "text-lg", sub: "text-xs" };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Emblem / Logo */}
      <div
        className={`${sizeClasses.icon} rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/20 flex-shrink-0 transition-transform hover:scale-105`}
        style={{
          background: `linear-gradient(135deg, ${institution.theme?.primaryColor || "#1e3a8a"}, ${institution.theme?.secondaryColor || "#4338ca"})`
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3/5 h-3/5">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-slate-900 ${sizeClasses.text}`}>
            {institution.name || "JOY University"}
          </span>
        </div>
        <span className={`font-semibold tracking-wider uppercase text-blue-700 mt-0.5 ${sizeClasses.sub}`}>
          {institution.productName || "Campus Event Hub"}
        </span>
        {showTagline && institution.tagline && (
          <p className="text-xs text-slate-500 mt-1 font-normal italic">
            "{institution.tagline}"
          </p>
        )}
      </div>
    </div>
  );
}
