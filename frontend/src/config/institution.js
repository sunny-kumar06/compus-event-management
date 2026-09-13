/**
 * Centralized Institution Configuration (Frontend)
 * Default Institution: JOY University
 * 
 * Provides fallback values before dynamic backend settings are loaded.
 */

export const defaultInstitution = {
  name: "JOY University",
  shortName: "JOY University",
  productName: "Campus Event Hub",
  tagline: "Smart Event Management for a Smarter Campus.",
  logo: "/assets/joy-university-logo.png",
  favicon: "/joy-icon.svg",
  website: "https://joy.edu",
  email: "events@joy.edu",
  phone: "+91 98765 43210",
  address: "JOY Knowledge City, Academic Ridge, Campus Drive, PIN 560001",
  theme: {
    primaryColor: "#1e3a8a",
    secondaryColor: "#4338ca",
    accentColor: "#059669",
    goldAccent: "#d97706",
    silverAccent: "#64748b",
    bronzeAccent: "#b45309"
  },
  departments: [
    { id: "CSE", name: "Computer Science & Engineering" },
    { id: "ECE", name: "Electronics & Communication Engineering" },
    { id: "ME", name: "Mechanical Engineering" },
    { id: "CE", name: "Civil Engineering" },
    { id: "IT", name: "Information Technology" },
    { id: "AI_DS", name: "Artificial Intelligence & Data Science" },
    { id: "MGMT", name: "School of Management & Business Studies" },
    { id: "BIOTECH", name: "Biotechnology & Bioinformatics" },
    { id: "ARTS_SCI", name: "School of Humanities & Basic Sciences" }
  ],
  academicYears: [
    { id: "1st_year", label: "1st Year (Freshman)" },
    { id: "2nd_year", label: "2nd Year (Sophomore)" },
    { id: "3rd_year", label: "3rd Year (Junior)" },
    { id: "4th_year", label: "4th Year (Senior)" },
    { id: "postgrad", label: "Postgraduate / Masters" },
    { id: "phd", label: "Doctoral / PhD" }
  ],
  categories: [
    { id: "all", name: "All Categories" },
    { id: "technical", name: "Technical & Hackathons", color: "blue" },
    { id: "cultural", name: "Cultural & Arts", color: "purple" },
    { id: "sports", name: "Sports & Athletics", color: "emerald" },
    { id: "workshops", name: "Workshops & Bootcamps", color: "amber" },
    { id: "seminars", name: "Seminars & Guest Lectures", color: "indigo" },
    { id: "competitions", name: "Competitions & Quizzes", color: "red" },
    { id: "club", name: "Club & Society Events", color: "teal" }
  ],
  footerText: `© ${new Date().getFullYear()} JOY University — Campus Event Hub. All rights reserved.`
};
