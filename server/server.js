import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import leaveRoutes from "./routes/leavesRoutes.js";

dotenv.config();

const app = express();

// ── Security — Helmet ─────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" })); // limit body size

// ── Rate Limiters ─────────────────────────────────────────────────────────────

// Global — 100 requests per 15 min per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
});

// Auth — strict: 10 attempts per 15 min (prevents brute force on login)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again in 15 minutes." },
    skipSuccessfulRequests: true, // only count failed requests
});

// OTP — 5 requests per 10 min (prevents OTP spam)
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many OTP requests. Please wait 10 minutes." },
});

// Apply global limiter to all routes
app.use("/api", globalLimiter);

// Apply strict limiter to auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", otpLimiter);
app.use("/api/auth/verify-otp", otpLimiter);
app.use("/api/auth/reset-password", otpLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
}));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Don't leak error details in production
    const isProd = process.env.NODE_ENV === "production";
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(isProd ? {} : { stack: err.stack }),
    });
});

// ── MongoDB + Start ───────────────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅  MongoDB connected");
        app.listen(process.env.PORT || 5000, () =>
            console.log(`🚀  Server running on port ${process.env.PORT || 5000}`)
        );
    })
    .catch((err) => {
        console.error("❌  MongoDB connection error:", err);
        process.exit(1);
    });