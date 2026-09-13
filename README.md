# JOY University — Campus Event Hub

> **A Complete, Production-Ready, Responsive Full-Stack College Event Management Boilerplate**
> Configured out of the box for **JOY University**, built with a centralized branding architecture allowing instant rebranding for any higher-education institution.

---

## 🏛️ Centralized Reusable Branding Architecture

The application is structured so that the institution name, short name, logos, color scheme, academic departments, and certificate signers are controlled from single configuration sources:

- **Frontend**: `frontend/src/config/institution.js` & dynamic database settings from `/api/settings`
- **Backend**: `backend/config/institution.js` & `SystemSettings` MongoDB model
- **Live Rebranding**: Administrators can dynamically modify institutional branding, tagline, contact emails, addresses, and colors directly from `/admin/settings`.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC)**
   - **Administrator**: Complete system control, 8-step event wizard, student & faculty rosters, certificate registry audit, system branding.
   - **Faculty / Teacher**: Scoped access strictly to assigned events. Can view participants, approve/reject registrations, launch live rotating QR attendance sessions, declare winners, and publish verified results.
   - **Student**: Discover events, submit dynamic custom form registrations, scan rotating QR codes to mark attendance, inspect verified results, view digital co-curricular achievement portfolio, and download tamper-proof certificates.

2. **8-Step Dynamic Event Creation Flow**
   - Step 1: Basic Information (Title, Category, Description, Banner)
   - Step 2: Date & Venue
   - Step 3: Registration Settings (Capacity, Deadlines, Eligibility, Rules)
   - Step 4: **Dynamic Registration Form Builder** (Supports Short Text, Long Text, Number, Email, Phone, Dropdown, Radio, Checkbox, Date, File, Team Name, URL with live preview)
   - Step 5: **Faculty Assignment** (Supports 1, 2, 3 or more faculty coordinators)
   - Step 6: Student Coordinator Assignment
   - Step 7: Live Preview
   - Step 8: Publish or Save as Draft

3. **Rotating QR Attendance Security Engine**
   - Generates time-window HMAC-SHA256 tokens that rotate every **30 seconds** on the faculty projector/display.
   - Prevents screenshot sharing or cheating.
   - Mobile-optimized camera scanner + manual alphanumeric token input fallback.
   - Real-time attendance rate calculation, Present/Late/Absent tagging, and CSV roster export.

4. **Event Results & Automated Achievement Transcript**
   - Teachers/Admins award 1st, 2nd, 3rd positions, Winner, Runner-Up, and Special Mentions.
   - Publishing results automatically updates the student's lifetime achievement stats (Total Participations, Gold 🥇, Silver 🥈, Bronze 🥉 counts).
   - Automatically issues official verifiable certificates.

5. **Verifiable University Certificates & Public Ledger**
   - High-resolution certificates with academic typography, official university seal, authorized signatures, and verification QR code.
   - Public verification endpoint: `/verify-certificate/:certificateId`.
   - Cryptographic SHA-256 verification hash ensures tamper-proof authenticity.
   - Print & PDF download layout.

---

## 🔑 Demo Accounts (1-Click Login)

The login screen (`/login`) includes 1-click credential selector buttons for effortless testing:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@joy.edu` | `Admin@123` | Full administrative control |
| **Faculty Coordinator** | `sharma@joy.edu` | `Faculty@123` | Dr. Rajesh Sharma (Professor & HOD, CSE) |
| **Faculty Coordinator** | `verma@joy.edu` | `Faculty@123` | Prof. Priya Verma (Associate Professor, ECE) |
| **Student (Winner 🥇)** | `sunny@joy.edu` | `Student@123` | Sunny Kumar (1st Place Hackathon & Quiz Winner) |
| **Student (Runner-up 🥈)** | `aman@joy.edu` | `Student@123` | Aman Sharma (2nd Place Quiz Champion) |

---

## 💻 Tech Stack

- **Backend**: Node.js, Express 5, MongoDB, Mongoose 9, JWT, bcryptjs, Helmet, CORS, QRCode.
- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, Axios, Canvas Confetti, HTML5-QRCode.
- **Database**: MongoDB (Local or Atlas compatible).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
node seeds/seed.js   # Seeds 1 Admin, 3 Faculty, 12 Students, 6 Events, Results & Certs
npm start            # Runs Express on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Runs Vite React app on http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### Frontend (Vercel)
1. Import the `frontend` folder into Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`

### Backend (Render / Railway)
1. Deploy the `backend` folder as a Web Service.
2. Start command: `node server.js`
3. Set environment variables:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/joy_campus_hub`
   - `JWT_SECRET=your_secure_jwt_secret`
   - `CLIENT_URL=https://your-frontend.vercel.app`
