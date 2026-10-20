import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error) => {
  if (error) console.error("❌  Email service error:", error.message);
  else console.log("✅  Email service ready");
});

const defaultHeaders = {
  "X-Priority": "3",
  "X-Mailer": "Offly HR System",
  "Precedence": "bulk",
  "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
};

// ── Welcome email ─────────────────────────────────────────────────────────────
const welcomeTemplate = ({ name, email, password, role, companyName = "Offly" }) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:40px auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#14b8a6,#06b6d4);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
      <div style="font-size:36px;margin-bottom:12px;">⚡</div>
      <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 6px;">${companyName}</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">HR Management System</p>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:40px;">
      <h2 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 10px;">Welcome, ${name}! 👋</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">Your account has been created on <strong style="color:#0891b2;">${companyName}</strong> HR portal.</p>
      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="color:#0f766e;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">Your Login Credentials</p>
        <div style="margin-bottom:14px;">
          <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;margin:0 0 4px;">Email</p>
          <p style="color:#1e293b;font-size:15px;font-weight:600;margin:0;background:#fff;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;">${email}</p>
        </div>
        <div style="margin-bottom:14px;">
          <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;margin:0 0 4px;">Temporary Password</p>
          <p style="color:#d97706;font-size:20px;font-weight:800;margin:0;background:#fff;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;letter-spacing:3px;font-family:monospace;">${password}</p>
        </div>
        <div>
          <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;margin:0 0 4px;">Role</p>
          <p style="color:#7c3aed;font-size:15px;font-weight:600;margin:0;text-transform:capitalize;">${role}</p>
        </div>
      </div>
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:16px;margin-bottom:28px;">
        <p style="color:#92400e;font-size:13px;line-height:1.6;margin:0;"><strong>⚠️ Important:</strong> You will be asked to change your password on your first login.</p>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#06b6d4);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;">Login to Portal →</a>
      </div>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">This is an automated message from ${companyName} HR System</p>
      </div>
    </div>
  </div>
</body></html>`;

// ── Forgot Password OTP email ─────────────────────────────────────────────────
const forgotPasswordTemplate = ({ name, otp, companyName = "Offly" }) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🔐</div>
      <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;">Password Reset</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">${companyName} HR System</p>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:40px;">
      <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 28px;">
        We received a request to reset your password. Use the OTP below to continue. This code expires in <strong style="color:#6366f1;">10 minutes</strong>.
      </p>

      <!-- OTP Box -->
      <div style="background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:2px solid #c7d2fe;border-radius:16px;padding:32px;text-align:center;margin-bottom:28px;">
        <p style="color:#4338ca;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Your OTP Code</p>
        <div style="display:inline-block;background:#fff;border:2px solid #6366f1;border-radius:12px;padding:16px 40px;">
          <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#4338ca;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#7c3aed;font-size:12px;margin:16px 0 0;font-weight:600;">⏱ Valid for 10 minutes only</p>
      </div>

      <!-- Warning -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin-bottom:28px;">
        <p style="color:#9a3412;font-size:13px;line-height:1.6;margin:0;">
          <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>

      <!-- Steps -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;">How to reset</p>
        ${["Go back to the Offly login page", "Click 'Forgot Password'", "Enter your email and this OTP code", "Set your new password"].map((s, i) => `
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
            <div style="width:22px;height:22px;min-width:22px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#fff;">${i + 1}</div>
            <p style="color:#64748b;font-size:13px;line-height:1.5;margin:2px 0 0;">${s}</p>
          </div>`).join("")}
      </div>

      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;">Go to Login →</a>
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">${companyName} HR System · Automated Security Email</p>
      </div>
    </div>
  </div>
</body></html>`;

// ── Leave status email ────────────────────────────────────────────────────────
const leaveStatusTemplate = ({ name, status, leaveType, startDate, endDate, reason }) => {
  const isApproved = status === "approved";
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
  return `
  <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#f4f7f9;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:520px;margin:40px auto;padding:20px;">
      <div style="background:${isApproved ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)"};border-radius:16px 16px 0 0;padding:36px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">${isApproved ? "✅" : "❌"}</div>
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;">Leave Request ${isApproved ? "Approved" : "Rejected"}</h1>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:36px;">
        <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">Your leave request has been <strong style="color:${isApproved ? "#059669" : "#dc2626"}">${status}</strong>.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
          ${[["Leave Type", leaveType?.charAt(0).toUpperCase() + leaveType?.slice(1)], ["Start Date", fmt(startDate)], ["End Date", fmt(endDate)], ["Reason", reason || "—"], ["Status", status?.charAt(0).toUpperCase() + status?.slice(1)]].map(([label, value]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #e2e8f0;">
              <span style="color:#64748b;font-size:13px;">${label}</span>
              <span style="color:#1e293b;font-size:13px;font-weight:700;">${value}</span>
            </div>`).join("")}
        </div>
        <div style="background:${isApproved ? "#f0fdf4" : "#fff1f2"};border:1px solid ${isApproved ? "#bbf7d0" : "#fecdd3"};border-radius:10px;padding:16px;text-align:center;margin-bottom:24px;">
          <p style="color:${isApproved ? "#166534" : "#9f1239"};font-size:14px;font-weight:600;margin:0;">${isApproved ? "🌟 Enjoy your time off!" : "Please contact your manager for more info."}</p>
        </div>
        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#06b6d4);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;">View My Leaves →</a>
        </div>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">Offly HR System · Automated Notification</p>
        </div>
      </div>
    </div>
  </body></html>`;
};

// ── Exports ───────────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async ({ name, email, password, role }) => {
  try {
    await transporter.sendMail({ ...defaultHeaders, from: `"Offly HR" <${process.env.EMAIL_USER}>`, to: email, subject: `Welcome to Offly HR — Your Account is Ready`, html: welcomeTemplate({ name, email, password, role }) });
    console.log(`✅  Welcome email sent to ${email}`);
    return true;
  } catch (e) { console.error(`❌  Welcome email error:`, e.message); return false; }
};

export const sendForgotPasswordEmail = async ({ name, email, otp }) => {
  try {
    await transporter.sendMail({ ...defaultHeaders, from: `"Offly HR" <${process.env.EMAIL_USER}>`, to: email, subject: `Your Password Reset OTP — Offly HR`, html: forgotPasswordTemplate({ name, otp }) });
    console.log(`✅  OTP email sent to ${email}`);
    return true;
  } catch (e) { console.error(`❌  OTP email error:`, e.message); return false; }
};

export const sendLeaveStatusEmail = async ({ to, name, status, leaveType, startDate, endDate, reason }) => {
  const isApproved = status === "approved";
  try {
    await transporter.sendMail({ ...defaultHeaders, from: `"Offly HR" <${process.env.EMAIL_USER}>`, to, subject: `Leave Request ${isApproved ? "Approved ✅" : "Rejected ❌"} — Offly HR`, html: leaveStatusTemplate({ name, status, leaveType, startDate, endDate, reason }) });
    console.log(`✅  Leave status email sent to ${to}`);
    return true;
  } catch (e) { console.error(`❌  Leave email error:`, e.message); return false; }
};