const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const AttendanceSession = require("../models/AttendanceSession");
const Attendance = require("../models/Attendance");
const EventResult = require("../models/EventResult");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const SystemSettings = require("../models/SystemSettings");

const { generateRegistrationId, generateCertificateId, generateVerificationHash } = require("../utils/idGenerator");
const { generateQRDataUrl } = require("../utils/qrHelper");
const { ROLES, RESULT_POSITIONS } = require("../config/constants");
const defaultInstitutionConfig = require("../config/institution");

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/joy_campus_hub";
    await mongoose.connect(mongoUri);
    console.log("[Seed] Connected to MongoDB.");

    // Clean existing collections
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await TeacherProfile.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Attendance.deleteMany({});
    await EventResult.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});
    await SystemSettings.deleteMany({});

    console.log("[Seed] Cleared existing data.");

    // 1. Initialize System Settings
    const systemSettings = await SystemSettings.create({
      institutionName: "JOY University",
      shortName: "JOY University",
      productName: "Campus Event Hub",
      tagline: "Smart Event Management for a Smarter Campus.",
      logo: "/assets/joy-university-logo.png",
      favicon: "/assets/favicon.png",
      website: "https://joy.edu",
      email: "events@joy.edu",
      phone: "+91 98765 43210",
      address: "JOY Knowledge City, Academic Ridge, Campus Drive, PIN 560001",
      primaryColor: "#1e3a8a",
      secondaryColor: "#4338ca",
      accentColor: "#059669",
      footerText: "© 2026 JOY University — Campus Event Hub. All rights reserved.",
      certificateSigners: defaultInstitutionConfig.certificates.signers
    });
    console.log("[Seed] System Settings initialized.");

    // 2. Create Admin
    const adminUser = await User.create({
      name: "JOY Admin",
      email: "admin@joy.edu",
      password: "Admin@123",
      role: ROLES.ADMIN,
      phone: "+91 98765 00001",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80"
    });
    console.log("[Seed] Admin created: admin@joy.edu");

    // 3. Create Teachers (3 faculty members)
    const teachersData = [
      {
        name: "Dr. Rajesh Sharma",
        email: "sharma@joy.edu",
        password: "Faculty@123",
        phone: "+91 98765 11101",
        employeeId: "JOY-FAC-101",
        department: "Computer Science & Engineering",
        designation: "Professor & Head of Department",
        officeRoom: "Academic Block A - 302",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80"
      },
      {
        name: "Prof. Priya Verma",
        email: "verma@joy.edu",
        password: "Faculty@123",
        phone: "+91 98765 11102",
        employeeId: "JOY-FAC-102",
        department: "Electronics & Communication Engineering",
        designation: "Associate Professor",
        officeRoom: "Academic Block B - 215",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&q=80"
      },
      {
        name: "Dr. Anita Nair",
        email: "anita@joy.edu",
        password: "Faculty@123",
        phone: "+91 98765 11103",
        employeeId: "JOY-FAC-103",
        department: "Artificial Intelligence & Data Science",
        designation: "Assistant Professor & Club Incharge",
        officeRoom: "Technology Tower - 404",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop&q=80"
      }
    ];

    const teacherDocs = [];
    for (const t of teachersData) {
      const u = await User.create({
        name: t.name,
        email: t.email,
        password: t.password,
        role: ROLES.TEACHER,
        phone: t.phone,
        avatar: t.avatar
      });
      await TeacherProfile.create({
        user: u._id,
        employeeId: t.employeeId,
        department: t.department,
        designation: t.designation,
        officeRoom: t.officeRoom,
        phone: t.phone
      });
      teacherDocs.push(u);
    }
    console.log(`[Seed] ${teacherDocs.length} Teachers created.`);

    // 4. Create Students (12 students across branches and years)
    const studentsRaw = [
      { name: "Sunny Kumar", email: "sunny@joy.edu", rollNumber: "JOY-2023-CS-001", department: "Computer Science & Engineering", academicYear: "3rd_year", semester: 5 },
      { name: "Aman Sharma", email: "aman@joy.edu", rollNumber: "JOY-2023-CS-002", department: "Computer Science & Engineering", academicYear: "3rd_year", semester: 5 },
      { name: "Sneha Patel", email: "sneha@joy.edu", rollNumber: "JOY-2023-AI-014", department: "Artificial Intelligence & Data Science", academicYear: "3rd_year", semester: 5 },
      { name: "Rohan Gupta", email: "rohan@joy.edu", rollNumber: "JOY-2024-EC-005", department: "Electronics & Communication Engineering", academicYear: "2nd_year", semester: 3 },
      { name: "Kavya Reddy", email: "kavya@joy.edu", rollNumber: "JOY-2024-EC-009", department: "Electronics & Communication Engineering", academicYear: "2nd_year", semester: 3 },
      { name: "Aditya Verma", email: "aditya@joy.edu", rollNumber: "JOY-2022-ME-021", department: "Mechanical Engineering", academicYear: "4th_year", semester: 7 },
      { name: "Meera Nair", email: "meera@joy.edu", rollNumber: "JOY-2022-CE-018", department: "Civil Engineering", academicYear: "4th_year", semester: 7 },
      { name: "Vikram Malhotra", email: "vikram@joy.edu", rollNumber: "JOY-2023-IT-032", department: "Information Technology", academicYear: "3rd_year", semester: 5 },
      { name: "Pooja Joshi", email: "pooja@joy.edu", rollNumber: "JOY-2025-CS-088", department: "Computer Science & Engineering", academicYear: "1st_year", semester: 1 },
      { name: "Arjun Das", email: "arjun@joy.edu", rollNumber: "JOY-2025-AI-045", department: "Artificial Intelligence & Data Science", academicYear: "1st_year", semester: 1 },
      { name: "Divya Kapoor", email: "divya@joy.edu", rollNumber: "JOY-2024-MGMT-011", department: "School of Management & Business Studies", academicYear: "2nd_year", semester: 3 },
      { name: "Siddharth Rao", email: "siddharth@joy.edu", rollNumber: "JOY-2023-BIOTECH-007", department: "Biotechnology & Bioinformatics", academicYear: "3rd_year", semester: 5 }
    ];

    const studentDocs = [];
    for (let i = 0; i < studentsRaw.length; i++) {
      const s = studentsRaw[i];
      const u = await User.create({
        name: s.name,
        email: s.email,
        password: "Student@123",
        role: ROLES.STUDENT,
        phone: `+91 98765 220${i < 10 ? "0" + i : i}`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 10000}?w=200&fit=crop&q=80`
      });

      const sp = await StudentProfile.create({
        user: u._id,
        rollNumber: s.rollNumber,
        department: s.department,
        academicYear: s.academicYear,
        semester: s.semester,
        contactPhone: u.phone,
        bio: `Undergraduate student at JOY University, passionate about events, technology and campus life.`,
        participationStats: {
          totalParticipated: 0,
          firstPositions: 0,
          secondPositions: 0,
          thirdPositions: 0,
          certificatesIssued: 0
        }
      });

      studentDocs.push({ user: u, profile: sp });
    }
    console.log(`[Seed] ${studentDocs.length} Students created.`);

    // 5. Create Events
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const futureDate3 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: "JOY Tech Fest 2026: 36-Hour National Hackathon",
        category: "technical",
        description: "The flagship annual hackathon of JOY University. Bring your boldest ideas in AI, Web3, Climate Tech, and HealthTech. Build real prototypes, pitch to venture capitalists, and win cash prizes!",
        banner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
        eventDate: futureDate1,
        startTime: "09:00 AM",
        endTime: "09:00 PM (Next Day)",
        venue: "JOY University Auditorium & Tech Lab Complex",
        regStartDate: now,
        regDeadline: new Date(futureDate1.getTime() - 24 * 60 * 60 * 1000),
        maxCapacity: 150,
        eligibility: "Open to all JOY University undergraduate and postgraduate students",
        rules: [
          "Teams must comprise 2 to 4 members.",
          "All code and assets must be developed during the hackathon window.",
          "Plagiarism or using pre-built turnkey products will lead to instant disqualification.",
          "Teams must bring their own laptops and chargers."
        ],
        facultyCoordinators: [teacherDocs[0]._id, teacherDocs[1]._id], // Multiple teachers
        studentCoordinators: [studentDocs[0].user._id, studentDocs[1].user._id],
        status: "registration_open",
        dynamicFormSchema: [
          { id: "team_name", label: "Team Name", type: "team_name", required: true, placeholder: "e.g. Binary Beasts", order: 1 },
          { id: "tech_stack", label: "Primary Tech Stack", type: "dropdown", required: true, options: ["Full Stack / MERN", "AI & Machine Learning", "Mobile / Flutter", "Cloud & DevOps"], order: 2 },
          { id: "github_url", label: "GitHub Profile / Organization URL", type: "url", required: false, placeholder: "https://github.com/username", order: 3 },
          { id: "dietary", label: "Dietary Preference (For Catering)", type: "radio", required: true, options: ["Vegetarian", "Non-Vegetarian", "Jain"], order: 4 }
        ],
        createdBy: adminUser._id
      },
      {
        title: "Sargam 2026: Annual Inter-College Cultural Fest",
        category: "cultural",
        description: "Celebrate music, rhythm, colors, and performing arts! Sargam is the grandest cultural carnival at JOY University featuring battle of the bands, classical fusion, street play, and fashion show.",
        banner: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
        eventDate: futureDate2,
        startTime: "10:00 AM",
        endTime: "08:00 PM",
        venue: "Open Air Amphitheatre, Campus South",
        regStartDate: now,
        regDeadline: new Date(futureDate2.getTime() - 48 * 60 * 60 * 1000),
        maxCapacity: 200,
        eligibility: "All JOY University Departments and Registered Student Clubs",
        rules: [
          "Performance duration must not exceed 8 minutes per participant/group.",
          "Audio tracks must be submitted 24 hours prior to the event.",
          "College ID card is mandatory at entry."
        ],
        facultyCoordinators: [teacherDocs[1]._id],
        studentCoordinators: [studentDocs[2].user._id],
        status: "registration_open",
        dynamicFormSchema: [
          { id: "performance_type", label: "Performance Category", type: "dropdown", required: true, options: ["Solo Singing", "Band / Group Music", "Solo Dance", "Group Dance", "Skit / Drama"], order: 1 },
          { id: "track_link", label: "Drive Link to Backing Track", type: "url", required: false, placeholder: "Google Drive or OneDrive link", order: 2 },
          { id: "instrument_req", label: "Special Audio/Stage Requirements", type: "textarea", required: false, placeholder: "List microphones, stands or instruments", order: 3 }
        ],
        createdBy: adminUser._id
      },
      {
        title: "Intra-University Badminton & Athletics Championship",
        category: "sports",
        description: "Showcase stamina, agility, and sportsmanship! Compete across singles and doubles badminton tournaments as well as 100m sprint, relay, and long jump.",
        banner: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200&auto=format&fit=crop&q=80",
        eventDate: futureDate3,
        startTime: "07:30 AM",
        endTime: "05:30 PM",
        venue: "JOY Sports Complex & Synthetic Athletic Track",
        regStartDate: now,
        regDeadline: new Date(futureDate3.getTime() - 24 * 60 * 60 * 1000),
        maxCapacity: 80,
        eligibility: "All JOY University Students with valid Sports Fitness Declaration",
        rules: [
          "Proper sports apparel and non-marking badminton shoes are mandatory inside indoor courts.",
          "Referee decisions are final."
        ],
        facultyCoordinators: [teacherDocs[0]._id, teacherDocs[2]._id],
        studentCoordinators: [studentDocs[5].user._id],
        status: "registration_open",
        dynamicFormSchema: [
          { id: "sport_category", label: "Event Chosen", type: "dropdown", required: true, options: ["Badminton Men's Singles", "Badminton Women's Singles", "Badminton Mixed Doubles", "100m Dash Sprint", "4x100m Relay"], order: 1 },
          { id: "tshirt_size", label: "Jersey / T-Shirt Size", type: "radio", required: true, options: ["S", "M", "L", "XL", "XXL"], order: 2 }
        ],
        createdBy: adminUser._id
      },
      {
        title: "Hands-On Workshop: Deep Learning with PyTorch & Generative AI",
        category: "workshops",
        description: "Intensive 1-day masterclass covering transformer architectures, fine-tuning large language models, multimodal models, and deploying inference pipelines.",
        banner: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&auto=format&fit=crop&q=80",
        eventDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: "10:00 AM",
        endTime: "04:30 PM",
        venue: "Seminar Hall 3, Block C",
        regStartDate: now,
        regDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        maxCapacity: 60,
        eligibility: "Pre-requisite: Basic Python programming experience",
        rules: [
          "Participants must bring a laptop with Python 3.10+ installed or a Google Colab account.",
          "Attendance in all sessions is required for workshop certification."
        ],
        facultyCoordinators: [teacherDocs[2]._id],
        studentCoordinators: [studentDocs[2].user._id],
        status: "registration_open",
        dynamicFormSchema: [
          { id: "experience_level", label: "Prior ML / Python Experience", type: "radio", required: true, options: ["Beginner", "Intermediate", "Advanced"], order: 1 },
          { id: "laptop_confirm", label: "Will you bring your personal laptop?", type: "dropdown", required: true, options: ["Yes, I will bring my laptop", "No, I need a lab desktop"], order: 2 }
        ],
        createdBy: adminUser._id
      },
      {
        title: "National Robotics League & RoboWars 2026",
        category: "technical",
        description: "High-octane combat robotics and autonomous line-followers! Watch metal clash in the enclosed arena as top college engineering teams compete for glory.",
        banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
        eventDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        startTime: "11:00 AM",
        endTime: "06:00 PM",
        venue: "Engineering Workshop Quadrangle",
        regStartDate: now,
        regDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        maxCapacity: 50,
        eligibility: "Engineering and Diploma students",
        rules: [
          "Robots must comply with 15kg or 30kg weight classes.",
          "Pneumatic pressure must not exceed safety limits."
        ],
        facultyCoordinators: [teacherDocs[0]._id],
        studentCoordinators: [studentDocs[3].user._id],
        status: "registration_open",
        dynamicFormSchema: [
          { id: "robot_name", label: "Robot Name", type: "text", required: true, placeholder: "e.g. Iron Crusher", order: 1 },
          { id: "weight_class", label: "Weight Category", type: "radio", required: true, options: ["15kg Featherweight", "30kg Middleweight"], order: 2 },
          { id: "safety_switch", label: "Has External Emergency Power Kill Switch?", type: "dropdown", required: true, options: ["Yes", "No"], order: 3 }
        ],
        createdBy: adminUser._id
      },
      {
        title: "JOY Annual Quiz Odyssey: Science, Tech & Pop-Culture",
        category: "competitions",
        description: "The intellectual battleground of JOY University! Fast-paced buzzer rounds, audio-visual puzzles, and cryptic challenges.",
        banner: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
        eventDate: pastDate,
        startTime: "02:00 PM",
        endTime: "05:30 PM",
        venue: "Main University Auditorium",
        regStartDate: new Date(pastDate.getTime() - 10 * 24 * 60 * 60 * 1000),
        regDeadline: new Date(pastDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        maxCapacity: 50,
        eligibility: "Open to all students",
        rules: ["Teams of 2.", "No mobile phones during live rounds."],
        facultyCoordinators: [teacherDocs[0]._id, teacherDocs[1]._id],
        studentCoordinators: [studentDocs[0].user._id],
        status: "completed",
        dynamicFormSchema: [
          { id: "team_name", label: "Team Name", type: "team_name", required: true, placeholder: "e.g. Quizards", order: 1 }
        ],
        createdBy: adminUser._id
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`[Seed] ${createdEvents.length} Events created.`);

    // 6. Create Registrations for Hackathon (event 0) & Quiz (event 5)
    const hackathonEvent = createdEvents[0];
    const quizEvent = createdEvents[5];

    const hackathonRegs = [];
    for (let i = 0; i < 8; i++) {
      const student = studentDocs[i].user;
      const regId = generateRegistrationId(2026);
      const reg = await Registration.create({
        registrationId: regId,
        event: hackathonEvent._id,
        student: student._id,
        customFormData: {
          team_name: `Team Alpha-${i + 1}`,
          tech_stack: "AI & Machine Learning",
          github_url: `https://github.com/student-${i + 1}`,
          dietary: i % 2 === 0 ? "Vegetarian" : "Non-Vegetarian"
        },
        status: "confirmed",
        registeredAt: new Date(now.getTime() - (8 - i) * 3600 * 1000)
      });
      hackathonRegs.push(reg);
    }
    await Event.findByIdAndUpdate(hackathonEvent._id, { currentRegistrationsCount: hackathonRegs.length });
    console.log(`[Seed] ${hackathonRegs.length} Registrations created for Hackathon.`);

    // Registrations for Quiz (Event 5)
    const quizRegs = [];
    for (let i = 0; i < 6; i++) {
      const student = studentDocs[i].user;
      const regId = generateRegistrationId(2026);
      const reg = await Registration.create({
        registrationId: regId,
        event: quizEvent._id,
        student: student._id,
        customFormData: {
          team_name: `Quizzers Club ${i + 1}`
        },
        status: "confirmed",
        registeredAt: new Date(pastDate.getTime() - 3 * 24 * 60 * 60 * 1000)
      });
      quizRegs.push(reg);
    }
    await Event.findByIdAndUpdate(quizEvent._id, { currentRegistrationsCount: quizRegs.length });
    console.log(`[Seed] ${quizRegs.length} Registrations created for Quiz.`);

    // 7. Attendance Session and records for Quiz
    const session = await AttendanceSession.create({
      event: quizEvent._id,
      createdBy: teacherDocs[0]._id,
      sessionSecret: "joy_seed_attendance_secret_hex_sample_2026",
      isActive: false,
      startedAt: pastDate,
      expiresAt: new Date(pastDate.getTime() + 2 * 3600 * 1000),
      rotationIntervalSeconds: 30
    });

    for (let i = 0; i < 5; i++) {
      await Attendance.create({
        student: quizRegs[i].student,
        event: quizEvent._id,
        registration: quizRegs[i]._id,
        sessionId: session._id,
        status: i === 4 ? "late" : "present",
        timestamp: new Date(pastDate.getTime() + (i + 1) * 300 * 1000),
        markedMethod: "qr_scan"
      });
    }
    console.log("[Seed] Attendance records created for completed event.");

    // 8. Event Results & Certificates for Quiz Event
    const quizWinners = [
      {
        position: RESULT_POSITIONS.FIRST,
        student: studentDocs[0].user._id, // Sunny Kumar
        registration: quizRegs[0]._id,
        title: "1st Position — Grand Quiz Champions 🥇",
        teamName: "Quizzers Club 1",
        remarks: "Flawless score in the buzzer and rapid-fire visual round.",
        score: "98/100"
      },
      {
        position: RESULT_POSITIONS.SECOND,
        student: studentDocs[1].user._id, // Aman Sharma
        registration: quizRegs[1]._id,
        title: "2nd Position — Runners Up 🥈",
        teamName: "Quizzers Club 2",
        remarks: "Outstanding performance in science and technology trivia.",
        score: "92/100"
      },
      {
        position: RESULT_POSITIONS.THIRD,
        student: studentDocs[2].user._id, // Sneha Patel
        registration: quizRegs[2]._id,
        title: "3rd Position — 2nd Runners Up 🥉",
        teamName: "Quizzers Club 3",
        remarks: "Remarkable performance in current affairs round.",
        score: "87/100"
      },
      {
        position: RESULT_POSITIONS.PARTICIPATION,
        student: studentDocs[3].user._id,
        registration: quizRegs[3]._id,
        title: "Certificate of Participation",
        teamName: "Quizzers Club 4",
        remarks: "Active participation in preliminary and semi-final rounds.",
        score: "78/100"
      }
    ];

    await EventResult.create({
      event: quizEvent._id,
      isPublished: true,
      publishedAt: new Date(pastDate.getTime() + 4 * 3600 * 1000),
      publishedBy: teacherDocs[0]._id,
      winners: quizWinners,
      generalRemarks: "Exceptional spirit of healthy academic competition across all university departments."
    });

    // Update student profiles & generate verifiable certificates
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    for (let i = 0; i < quizWinners.length; i++) {
      const win = quizWinners[i];
      const certId = `JOY-CERT-2026-00010${i + 1}`;
      const hash = generateVerificationHash(certId, win.student.toString(), quizEvent._id.toString());
      const qrDataUrl = await generateQRDataUrl(`${clientUrl}/verify-certificate/${certId}`);

      const sDoc = studentDocs.find((d) => d.user._id.toString() === win.student.toString());

      await Certificate.create({
        certificateId: certId,
        student: win.student,
        event: quizEvent._id,
        achievementTitle: win.title,
        position: win.position,
        issueDate: pastDate,
        signers: defaultInstitutionConfig.certificates.signers,
        verificationHash: hash,
        qrCodeDataUrl: qrDataUrl,
        metadata: {
          studentName: sDoc.user.name,
          rollNumber: sDoc.profile.rollNumber,
          department: sDoc.profile.department,
          eventTitle: quizEvent.title,
          eventCategory: quizEvent.category,
          eventDate: quizEvent.eventDate
        }
      });

      // Update Student Profile stats
      const incFields = {
        "participationStats.totalParticipated": 1,
        "participationStats.certificatesIssued": 1
      };
      if (win.position === "1st") incFields["participationStats.firstPositions"] = 1;
      if (win.position === "2nd") incFields["participationStats.secondPositions"] = 1;
      if (win.position === "3rd") incFields["participationStats.thirdPositions"] = 1;

      await StudentProfile.findOneAndUpdate({ user: win.student }, { $inc: incFields });

      // Create in-app notification
      await Notification.create({
        recipient: win.student,
        title: "Official JOY University Certificate Ready!",
        message: `Your certificate for "${quizEvent.title}" (${win.title}) is now available for download. Verification ID: ${certId}.`,
        type: "certificate",
        link: `/student/certificates`,
        isRead: false
      });
    }
    console.log("[Seed] Results, Certificates and Notifications populated.");

    console.log("\n====================================================");
    console.log("  JOY University — Campus Event Hub Seed Complete!  ");
    console.log("====================================================");
    console.log("  Demo Credentials:");
    console.log("  --------------------------------------------------");
    console.log("  ADMIN:    admin@joy.edu     / Admin@123");
    console.log("  FACULTY:  sharma@joy.edu    / Faculty@123 (Dr. Rajesh Sharma)");
    console.log("            verma@joy.edu     / Faculty@123 (Prof. Priya Verma)");
    console.log("  STUDENT:  sunny@joy.edu     / Student@123 (Sunny Kumar - 🥇 1st place)");
    console.log("            aman@joy.edu      / Student@123 (Aman Sharma - 🥈 2nd place)");
    console.log("            sneha@joy.edu     / Student@123 (Sneha Patel - 🥉 3rd place)");
    console.log("====================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("[Seed Error]", error);
    process.exit(1);
  }
};

seedData();
