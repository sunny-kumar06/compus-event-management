/**
 * Mock data fallback for static cloud deployments (e.g. Vercel)
 * when a live Node.js / MongoDB backend server is not yet attached.
 */

export const mockUsers = {
  "admin@joy.edu": {
    _id: "6aa6ef8a596fd94c23ad52a5",
    name: "JOY Admin",
    email: "admin@joy.edu",
    role: "admin",
    phone: "+91 98765 00001",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80"
  },
  "sharma@joy.edu": {
    _id: "6aa6ef8a596fd94c23ad52a6",
    name: "Dr. Rajesh Sharma",
    email: "sharma@joy.edu",
    role: "teacher",
    phone: "+91 98765 11101",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80"
  },
  "verma@joy.edu": {
    _id: "6aa6ef8b596fd94c23ad52a8",
    name: "Prof. Priya Verma",
    email: "verma@joy.edu",
    role: "teacher",
    phone: "+91 98765 11102",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&q=80"
  },
  "sunny@joy.edu": {
    _id: "6aa6ef8b596fd94c23ad52ac",
    name: "Sunny Kumar",
    email: "sunny@joy.edu",
    role: "student",
    phone: "+91 98765 22000",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop&q=80",
    rollNumber: "JOY-2023-CS-001",
    department: "Computer Science & Engineering",
    academicYear: "3rd_year",
    semester: 5
  },
  "aman@joy.edu": {
    _id: "6aa6ef8c596fd94c23ad52ae",
    name: "Aman Sharma",
    email: "aman@joy.edu",
    role: "student",
    phone: "+91 98765 22001",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80",
    rollNumber: "JOY-2023-CS-002",
    department: "Computer Science & Engineering",
    academicYear: "3rd_year",
    semester: 5
  },
  "sneha@joy.edu": {
    _id: "6aa6ef8c596fd94c23ad52b0",
    name: "Sneha Patel",
    email: "sneha@joy.edu",
    role: "student",
    phone: "+91 98765 22002",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&q=80",
    rollNumber: "JOY-2023-AI-014",
    department: "Artificial Intelligence & Data Science",
    academicYear: "3rd_year",
    semester: 5
  }
};

export const mockEvents = [
  {
    _id: "6aa6ef8d596fd94c23ad52c4",
    title: "JOY Tech Fest 2026: 36-Hour National Hackathon",
    category: "technical",
    description: "The flagship annual hackathon of JOY University. Bring your boldest ideas in AI, Web3, Climate Tech, and HealthTech. Build real prototypes, pitch to venture capitalists, and win cash prizes!",
    banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
    eventDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    startTime: "09:00 AM",
    endTime: "09:00 PM (Next Day)",
    venue: "JOY University Auditorium & Tech Lab Complex",
    regStartDate: new Date().toISOString(),
    regDeadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    maxCapacity: 150,
    currentRegistrationsCount: 8,
    eligibility: "Open to all JOY University undergraduate and postgraduate students",
    rules: [
      "Teams must comprise 2 to 4 members.",
      "All code and assets must be developed during the hackathon window.",
      "Plagiarism or using pre-built turnkey products will lead to instant disqualification."
    ],
    facultyCoordinators: [mockUsers["sharma@joy.edu"], mockUsers["verma@joy.edu"]],
    studentCoordinators: [mockUsers["sunny@joy.edu"]],
    status: "registration_open",
    dynamicFormSchema: [
      { id: "team_name", label: "Team Name", type: "team_name", required: true, placeholder: "e.g. Binary Beasts", order: 1 },
      { id: "tech_stack", label: "Primary Tech Stack", type: "dropdown", required: true, options: ["Full Stack / MERN", "AI & Machine Learning", "Mobile / Flutter", "Cloud & DevOps"], order: 2 }
    ]
  },
  {
    _id: "6aa6ef8d596fd94c23ad52c5",
    title: "Sargam 2026: Annual Inter-College Cultural Fest",
    category: "cultural",
    description: "Celebrate music, rhythm, colors, and performing arts! Sargam is the grandest cultural carnival at JOY University featuring battle of the bands, classical fusion, street play, and fashion show.",
    banner: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
    eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    startTime: "10:00 AM",
    endTime: "08:00 PM",
    venue: "Open Air Amphitheatre, Campus South",
    regStartDate: new Date().toISOString(),
    regDeadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    maxCapacity: 200,
    currentRegistrationsCount: 14,
    eligibility: "All JOY University Departments and Registered Student Clubs",
    rules: ["Performance duration must not exceed 8 minutes.", "College ID card is mandatory."],
    facultyCoordinators: [mockUsers["verma@joy.edu"]],
    studentCoordinators: [mockUsers["sneha@joy.edu"]],
    status: "registration_open",
    dynamicFormSchema: [
      { id: "performance_type", label: "Performance Category", type: "dropdown", required: true, options: ["Solo Singing", "Band / Group Music", "Solo Dance", "Group Dance"], order: 1 }
    ]
  },
  {
    _id: "6aa6ef8d596fd94c23ad52c7",
    title: "Hands-On Workshop: Deep Learning with PyTorch & Generative AI",
    category: "workshops",
    description: "Intensive 1-day masterclass covering transformer architectures, fine-tuning large language models, multimodal models, and deploying inference pipelines.",
    banner: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&auto=format&fit=crop&q=80",
    eventDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    startTime: "10:00 AM",
    endTime: "04:30 PM",
    venue: "Seminar Hall 3, Block C",
    regStartDate: new Date().toISOString(),
    regDeadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    maxCapacity: 60,
    currentRegistrationsCount: 22,
    eligibility: "Pre-requisite: Basic Python programming experience",
    rules: ["Bring a laptop with Python 3.10+ installed."],
    facultyCoordinators: [mockUsers["sharma@joy.edu"]],
    status: "registration_open"
  },
  {
    _id: "6aa6ef8d596fd94c23ad52c9",
    title: "JOY Annual Quiz Odyssey: Science, Tech & Pop-Culture",
    category: "competitions",
    description: "The intellectual battleground of JOY University! Fast-paced buzzer rounds, audio-visual puzzles, and cryptic challenges.",
    banner: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
    eventDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    startTime: "02:00 PM",
    endTime: "05:30 PM",
    venue: "Main University Auditorium",
    regStartDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    regDeadline: new Date(Date.now() - 6 * 86400000).toISOString(),
    maxCapacity: 50,
    currentRegistrationsCount: 6,
    eligibility: "Open to all students",
    rules: ["Teams of 2.", "No mobile phones during live rounds."],
    facultyCoordinators: [mockUsers["sharma@joy.edu"]],
    status: "completed"
  }
];

export const mockCertificates = [
  {
    certificateId: "JOY-CERT-2026-000101",
    student: mockUsers["sunny@joy.edu"],
    event: mockEvents[3],
    achievementTitle: "1st Position — Grand Quiz Champions 🥇",
    position: "1st",
    issueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    signers: [
      { name: "Dr. K. S. Ramanathan", title: "Dean of Student Affairs", institution: "JOY University" },
      { name: "Prof. Anjali Deshmukh", title: "Director, Events Council", institution: "JOY University" }
    ],
    metadata: {
      studentName: "Sunny Kumar",
      rollNumber: "JOY-2023-CS-001",
      department: "Computer Science & Engineering",
      eventTitle: "JOY Annual Quiz Odyssey: Science, Tech & Pop-Culture",
      eventCategory: "competitions",
      eventDate: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  }
];

export const mockStats = {
  totalEvents: 6,
  totalRegistrations: 28,
  totalCertificates: 14,
  activeStudents: 12,
  activeTeachers: 3,
  attendanceRate: "94%"
};
