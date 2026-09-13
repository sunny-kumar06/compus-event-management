const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security and middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    institution: "JOY University",
    service: "Campus Event Hub API",
    time: new Date()
  });
});

// Mount Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/authRoutes")); // Convenience aliases: /api/login, /api/register
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));

// Serve Frontend Static Assets
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Catch 404 for unhandled API routes only
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// SPA fallback for all frontend pages (e.g. /login, /register, /events, /student/*, /admin/*)
app.use((req, res, next) => {
  if (req.method === "GET") {
    return res.sendFile("index.html", { root: frontendDist });
  }
  next();
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  JOY University — Campus Event Hub Server`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
