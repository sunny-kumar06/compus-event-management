import React from "react";
import { Link } from "react-router-dom";
import { useInstitution } from "../../context/InstitutionContext";
import InstitutionLogo from "./InstitutionLogo";
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const { institution } = useInstitution();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Institution Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                🎓
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {institution.name}
                </h3>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {institution.productName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {institution.tagline || "Smart Event Management for a Smarter Campus."}
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{institution.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{institution.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{institution.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Campus Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Upcoming Events & Fests
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Faculty Coordinator Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  University Administrator Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  New Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Credentials & Verification
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/verify-certificate/JOY-CERT-2026-000101"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Public Certificate Verification</span>
                </Link>
              </li>
              <li className="text-slate-400">
                Official Digital Co-Curricular Transcripts
              </li>
              <li className="text-slate-400">
                Rotating QR Attendance Protocol
              </li>
              <li className="text-slate-400">
                Cryptographic Issue Hash Authentication
              </li>
            </ul>
          </div>

          {/* Reusable Boilerplate Notice */}
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Campus Event Hub Boilerplate
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Configured for <strong className="text-white">{institution.name}</strong>. Fully customizable for any college or university through centralized configuration.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} {institution.name} — {institution.productName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href={institution.website} target="_blank" rel="noreferrer" className="hover:text-slate-400 flex items-center gap-1">
              <span>{institution.website?.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
