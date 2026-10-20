import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "manager", "employee"],
        default: "employee",
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    mustChangePassword: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
    },
    avatar: {
        type: String,
    },
    // ── Password Reset OTP ──────────────────────────────────────────────────────
    resetOTP: {
        type: String,
        default: null,
    },
    resetOTPExpiry: {
        type: Date,
        default: null,
    },
    resetOTPAttempts: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

export default mongoose.model("User", userSchema);