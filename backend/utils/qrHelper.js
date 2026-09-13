const crypto = require("crypto");
const QRCode = require("qrcode");
const { ATTENDANCE_SESSION } = require("../config/constants");

const getWindowNumber = (intervalSeconds = ATTENDANCE_SESSION.ROTATION_INTERVAL_SECONDS) => {
  return Math.floor(Date.now() / (intervalSeconds * 1000));
};

const getSecondsRemainingInWindow = (intervalSeconds = ATTENDANCE_SESSION.ROTATION_INTERVAL_SECONDS) => {
  const currentMs = Date.now();
  const intervalMs = intervalSeconds * 1000;
  const elapsedInWindow = currentMs % intervalMs;
  return Math.max(1, Math.floor((intervalMs - elapsedInWindow) / 1000));
};

const generateTokenForWindow = (sessionSecret, windowNum) => {
  return crypto
    .createHmac("sha256", sessionSecret)
    .update(`joy-att-window:${windowNum}`)
    .digest("hex")
    .substring(0, 12)
    .toUpperCase();
};

const generateQRDataUrl = async (qrPayload) => {
  try {
    const stringData = typeof qrPayload === "string" ? qrPayload : JSON.stringify(qrPayload);
    const dataUrl = await QRCode.toDataURL(stringData, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#1e3a8a", // JOY University Navy Blue
        light: "#ffffff"
      }
    });
    return dataUrl;
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    throw error;
  }
};

const verifyRotatingToken = (sessionSecret, candidateToken, intervalSeconds = ATTENDANCE_SESSION.ROTATION_INTERVAL_SECONDS) => {
  if (!candidateToken || !sessionSecret) return false;
  const currentWindow = getWindowNumber(intervalSeconds);
  const normalizedCandidate = candidateToken.trim().toUpperCase();

  // Check current window, previous window (-1 for clock skew/network latency), and next (+1)
  const validWindows = [currentWindow, currentWindow - 1, currentWindow + 1];

  for (const win of validWindows) {
    const expected = generateTokenForWindow(sessionSecret, win);
    if (expected === normalizedCandidate) {
      return true;
    }
  }
  return false;
};

module.exports = {
  getWindowNumber,
  getSecondsRemainingInWindow,
  generateTokenForWindow,
  generateQRDataUrl,
  verifyRotatingToken
};
