module.exports = {
  ROLES: {
    ADMIN: "admin",
    TEACHER: "teacher",
    STUDENT: "student",
    COORDINATOR: "coordinator"
  },

  REGISTRATION_STATUS: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    REJECTED: "rejected",
    CANCELLED: "cancelled"
  },

  ATTENDANCE_STATUS: {
    PRESENT: "present",
    LATE: "late",
    ABSENT: "absent"
  },

  RESULT_POSITIONS: {
    FIRST: "1st",
    SECOND: "2nd",
    THIRD: "3rd",
    WINNER: "winner",
    RUNNER_UP: "runner_up",
    SPECIAL_MENTION: "special_mention",
    PARTICIPATION: "participation"
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  ATTENDANCE_SESSION: {
    ROTATION_INTERVAL_SECONDS: 30, // Rotating QR code changes every 30 seconds
    EXPIRATION_GRACE_SECONDS: 10 // Grace period for latency
  }
};
