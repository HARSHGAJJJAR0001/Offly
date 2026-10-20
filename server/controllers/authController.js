import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendForgotPasswordEmail } from "../utils/emailService.js";

// ── Generate 6-digit OTP ──────────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).populate("departmentId");
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        mustChangePassword: user.mustChangePassword || false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/change-password  (logged in user)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("departmentId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────

// POST /api/auth/forgot-password
// Step 1 — user enters email → send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    // Always return success even if user not found (security — don't reveal emails)
    if (!user) {
      return res.json({ message: "If that email exists, an OTP has been sent." });
    }

    // Rate limit — don't allow resend within 1 minute
    if (user.resetOTPExpiry && new Date() < new Date(user.resetOTPExpiry - 9 * 60 * 1000)) {
      return res.status(429).json({ message: "Please wait before requesting another OTP." });
    }

    const otp = generateOTP();

    // Save OTP — hashed for security, expires in 10 minutes
    user.resetOTP = await bcrypt.hash(otp, 10);
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.resetOTPAttempts = 0;
    await user.save();

    // Send OTP email
    await sendForgotPasswordEmail({ name: user.name, email: user.email, otp });

    res.json({ message: "OTP sent to your email address." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/verify-otp
// Step 2 — user enters OTP → verify
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Check expiry
    if (new Date() > new Date(user.resetOTPExpiry)) {
      user.resetOTP = null; user.resetOTPExpiry = null; user.resetOTPAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Max 5 attempts
    if (user.resetOTPAttempts >= 5) {
      user.resetOTP = null; user.resetOTPExpiry = null; user.resetOTPAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "Too many attempts. Please request a new OTP." });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      user.resetOTPAttempts += 1;
      await user.save();
      const remaining = 5 - user.resetOTPAttempts;
      return res.status(400).json({ message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` });
    }

    // OTP correct — issue a short-lived reset token (just a flag in DB)
    user.resetOTPAttempts = 0;
    // Keep OTP hash as "verified" marker — will be cleared on password reset
    await user.save();

    res.json({ message: "OTP verified successfully.", verified: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/reset-password
// Step 3 — user enters new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Check expiry again
    if (new Date() > new Date(user.resetOTPExpiry)) {
      user.resetOTP = null; user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Verify OTP one final time
    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP. Please try again." });

    // Reset password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.resetOTPAttempts = 0;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};