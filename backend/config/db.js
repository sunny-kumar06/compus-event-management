const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/joy_campus_hub";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Only exit in local development if explicitly desired, avoid hard crashes on serverless cold starts
    if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
      console.warn("[MongoDB] Please ensure MongoDB service is running locally at 127.0.0.1:27017");
    }
  }
};

module.exports = connectDB;
