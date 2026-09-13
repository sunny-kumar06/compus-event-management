/**
 * Centralized Institution Configuration
 * Default Institution: JOY University
 * 
 * This file serves as the single source of truth for university branding,
 * department lists, academic configurations, and certificate authorities.
 * It can be overridden dynamically at runtime by the SystemSettings model in MongoDB.
 */

module.exports = {
  institution: {
    name: "JOY University",
    shortName: "JOY University",
    productName: "Campus Event Hub",
    tagline: "Smart Event Management for a Smarter Campus.",
    logo: "/assets/joy-university-logo.png",
    favicon: "/assets/favicon.png",
    website: "https://joy.edu",
    email: "events@joy.edu",
    phone: "+91 98765 43210",
    address: "JOY Knowledge City, Academic Ridge, Campus Drive, PIN 560001",
    theme: {
      primaryColor: "#1e3a8a", // Navy Blue
      primaryHover: "#172554",
      secondaryColor: "#4338ca", // Royal Indigo
      accentColor: "#059669", // Emerald Green
      goldAccent: "#d97706", // Amber Gold for 1st place
      silverAccent: "#64748b", // Slate Silver for 2nd place
      bronzeAccent: "#b45309" // Bronze for 3rd place
    },
    socialLinks: {
      twitter: "https://twitter.com/joyuniversity",
      linkedin: "https://linkedin.com/school/joyuniversity",
      instagram: "https://instagram.com/joyuniversity"
    },
    footerText: "© {year} JOY University — Campus Event Hub. All rights reserved."
  },

  academic: {
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
    semesters: [1, 2, 3, 4, 5, 6, 7, 8]
  },

  events: {
    categories: [
      { id: "technical", name: "Technical & Hackathons", color: "blue", icon: "Code" },
      { id: "cultural", name: "Cultural & Arts", color: "purple", icon: "Music" },
      { id: "sports", name: "Sports & Athletics", color: "green", icon: "Activity" },
      { id: "workshops", name: "Workshops & Bootcamps", color: "amber", icon: "Cpu" },
      { id: "seminars", name: "Seminars & Guest Lectures", color: "indigo", icon: "BookOpen" },
      { id: "competitions", name: "Competitions & Quizzes", color: "red", icon: "Trophy" },
      { id: "club", name: "Club & Society Events", color: "teal", icon: "Users" }
    ],
    statuses: [
      "draft",
      "published",
      "registration_open",
      "registration_closed",
      "ongoing",
      "completed",
      "cancelled"
    ]
  },

  certificates: {
    prefix: "JOY-CERT",
    signers: [
      {
        name: "Dr. K. S. Ramanathan",
        title: "Dean of Student Affairs",
        institution: "JOY University"
      },
      {
        name: "Prof. Anjali Deshmukh",
        title: "Director, Campus Events Council",
        institution: "JOY University"
      }
    ],
    verificationBaseUrl: "/verify-certificate"
  },

  registration: {
    idPrefix: "JOY-EVT"
  }
};
