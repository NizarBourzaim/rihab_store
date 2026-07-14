const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/sendEmail");
const {
  CODE_TTL_MS,
  MAX_ATTEMPTS,
  generateVerificationCode,
  hashVerificationCode,
} = require("../utils/verificationCode");

// Generous enough for normal use, tight enough to blunt brute-forcing passwords/codes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

function sendVerificationEmail(email, code) {
  return sendEmail({
    to: email,
    subject: "Verify your Rinifaza Store account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #D4AF37; text-align: center;">Verify your email</h2>
        <p>Thanks for registering with Rinifaza Store. Enter this code to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D4AF37;">${code}</span>
        </div>
        <p>This code expires in 15 minutes. If you did not create this account, you can ignore this email.</p>
        <p>Best regards,<br>The Rinifaza Team</p>
      </div>
    `,
  });
}

router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const code = generateVerificationCode();
    const verificationCode = hashVerificationCode(code);
    const verificationCodeExpires = Date.now() + CODE_TTL_MS;

    let user;
    if (existing) {
      // Unverified account re-registering: refresh their details and issue a fresh code.
      existing.name = name;
      existing.password = password;
      existing.phone = phone;
      existing.address = address;
      existing.verificationCode = verificationCode;
      existing.verificationCodeExpires = verificationCodeExpires;
      existing.verificationAttempts = 0;
      user = await existing.save();
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        verificationCode,
        verificationCodeExpires,
      });
    }

    await sendVerificationEmail(user.email, code);

    res.status(201).json({
      message: "A verification code has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify-email", codeLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    if (!user.verificationCode || !user.verificationCodeExpires || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.verificationAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
    }

    if (hashVerificationCode(code) !== user.verificationCode) {
      user.verificationAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.verificationAttempts = 0;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      isOrderManager: user.isOrderManager,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/resend-verification", codeLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    const code = generateVerificationCode();
    user.verificationCode = hashVerificationCode(code);
    user.verificationCodeExpires = Date.now() + CODE_TTL_MS;
    user.verificationAttempts = 0;
    await user.save();

    await sendVerificationEmail(user.email, code);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin,
      isOrderManager: user.isOrderManager,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset email
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #D4AF37; text-align: center;">Password Reset Request</h2>
          <p>You requested a password reset. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
          <p>Best regards,<br>The Rinifaza Team</p>
        </div>
      `,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put("/me", protect, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Both current and new password are required" });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      user.password = newPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      isOrderManager: updatedUser.isOrderManager,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
