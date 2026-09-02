const crypto = require("crypto");

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashVerificationCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

module.exports = {
  CODE_TTL_MS,
  MAX_ATTEMPTS,
  generateVerificationCode,
  hashVerificationCode,
};
