const crypto = require("crypto");
const institutionConfig = require("../config/institution");

const generateRegistrationId = (year = new Date().getFullYear()) => {
  const prefix = institutionConfig.registration.idPrefix || "JOY-EVT";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${randomNum}`;
};

const generateCertificateId = (year = new Date().getFullYear()) => {
  const prefix = institutionConfig.certificates.prefix || "JOY-CERT";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${randomNum}`;
};

const generateVerificationHash = (certificateId, studentId, eventId) => {
  const secret = process.env.JWT_SECRET || "joy_university_hub_super_secret_key_2026";
  return crypto
    .createHmac("sha256", secret)
    .update(`${certificateId}:${studentId}:${eventId}`)
    .digest("hex");
};

module.exports = {
  generateRegistrationId,
  generateCertificateId,
  generateVerificationHash
};
