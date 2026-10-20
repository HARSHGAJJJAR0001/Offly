import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Lock, RefreshCw } from "lucide-react";
import API from "../../api/axios";

// ── Steps: 1=email, 2=otp, 3=new password ────────────────────────────────────
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPwd, setNewPwd] = useState("");
    const [confPwd, setConfPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timer, setTimer] = useState(0);

    const otpRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (timer <= 0) return;
        const t = setTimeout(() => setTimer(v => v - 1), 1000);
        return () => clearTimeout(t);
    }, [timer]);

    // ── Step 1: Send OTP ────────────────────────────────────────────────────────
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email.trim()) return setError("Please enter your email address.");
        setError(""); setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email: email.trim() });
            setSuccess("OTP sent! Check your email inbox.");
            setStep(2);
            setTimer(60); // 60s cooldown before resend
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP.");
        } finally { setLoading(false); }
    };

    // ── Resend OTP ──────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (timer > 0) return;
        setError(""); setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email: email.trim() });
            setSuccess("New OTP sent!");
            setOtp(["", "", "", "", "", ""]);
            setTimer(60);
            otpRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend OTP.");
        } finally { setLoading(false); }
    };

    // ── OTP input handlers ──────────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // numbers only
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length !== 6) return setError("Please enter the complete 6-digit OTP.");
        setError(""); setLoading(true);
        try {
            await API.post("/auth/verify-otp", { email: email.trim(), otp: otpValue });
            setSuccess("OTP verified!");
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP.");
        } finally { setLoading(false); }
    };

    // ── Step 3: Reset Password ──────────────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPwd.length < 6) return setError("Password must be at least 6 characters.");
        if (newPwd !== confPwd) return setError("Passwords do not match.");
        setError(""); setLoading(true);
        try {
            await API.post("/auth/reset-password", {
                email: email.trim(),
                otp: otp.join(""),
                newPassword: newPwd,
            });
            setSuccess("Password reset successfully!");
            setStep(4); // success screen
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally { setLoading(false); }
    };

    // ── Password strength ───────────────────────────────────────────────────────
    const strength = (p) => {
        if (!p) return { score: 0, label: "", color: "" };
        if (p.length < 6) return { score: 1, label: "Too short", color: "#f87171" };
        if (p.length < 8) return { score: 2, label: "Weak", color: "#fbbf24" };
        if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { score: 4, label: "Strong", color: "#34d399" };
        return { score: 3, label: "Medium", color: "#67e8f9" };
    };
    const str = strength(newPwd);

    const inp = {
        width: "100%", padding: "12px 14px 12px 40px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "11px", color: "#e2e8f0", fontSize: "14px",
        fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s",
    };

    const STEPS = [
        { num: 1, label: "Email" },
        { num: 2, label: "OTP" },
        { num: 3, label: "Reset" },
    ];

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(ellipse at 20% 50%, #0d1f3c 0%, #0a0f1e 40%, #060d1a 100%)",
            fontFamily: "'DM Sans',sans-serif", padding: "20px",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        .otp-input:focus{border-color:rgba(99,102,241,0.6)!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)!important}
        .back-btn:hover{color:#e2e8f0!important}
        input:focus{border-color:rgba(99,102,241,0.5)!important;box-shadow:0 0 0 3px rgba(99,102,241,0.08)!important}
      `}</style>

            <div style={{ width: "100%", maxWidth: "420px", animation: "fadeUp 0.5s ease" }}>

                {/* Back to login */}
                {step < 4 && (
                    <button className="back-btn" onClick={() => step === 1 ? navigate("/") : setStep(s => s - 1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "rgba(100,116,139,0.6)", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: "20px", padding: 0, transition: "color 0.2s" }}>
                        <ArrowLeft size={15} /> {step === 1 ? "Back to Login" : "Back"}
                    </button>
                )}

                {/* Step indicator */}
                {step < 4 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "28px" }}>
                        {STEPS.map((s, i) => (
                            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                    <div style={{
                                        width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "12px", fontWeight: "700", transition: "all 0.3s",
                                        background: step > s.num ? "#6366f1" : step === s.num ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)",
                                        color: step >= s.num ? "#fff" : "rgba(100,116,139,0.5)",
                                        border: step === s.num ? "2px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                        boxShadow: step === s.num ? "0 0 16px rgba(99,102,241,0.4)" : "none",
                                    }}>
                                        {step > s.num ? <CheckCircle size={14} /> : s.num}
                                    </div>
                                    <span style={{ fontSize: "12px", fontWeight: "600", color: step >= s.num ? "#c4b5fd" : "rgba(100,116,139,0.5)" }}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: "1px", background: step > s.num ? "#6366f1" : "rgba(255,255,255,0.07)", margin: "0 12px", transition: "background 0.3s" }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Card */}
                <div style={{
                    background: "rgba(8,14,28,0.92)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "24px", padding: "36px 32px", backdropFilter: "blur(40px)",
                    boxShadow: "0 0 0 1px rgba(99,102,241,0.05), 0 32px 80px rgba(0,0,0,0.7)",
                    position: "relative", overflow: "hidden",
                }}>
                    {/* Top shine */}
                    <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.6),transparent)" }} />

                    {/* ── STEP 1: Enter Email ── */}
                    {step === 1 && (
                        <>
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                    <Mail size={22} color="#a5b4fc" />
                                </div>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: "#f0fdf4", marginBottom: "6px", letterSpacing: "-0.5px" }}>Forgot Password?</h2>
                                <p style={{ fontSize: "13.5px", color: "rgba(100,116,139,0.65)", lineHeight: 1.6 }}>No worries! Enter your registered email and we'll send you a 6-digit OTP to reset your password.</p>
                            </div>

                            {error && <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}><AlertCircle size={14} color="#f87171" /><span style={{ fontSize: "13px", color: "#fca5a5" }}>{error}</span></div>}
                            {success && <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}><CheckCircle size={14} color="#34d399" /><span style={{ fontSize: "13px", color: "#6ee7b7" }}>{success}</span></div>}

                            <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Email Address</label>
                                    <div style={{ position: "relative" }}>
                                        <Mail size={15} color="rgba(100,116,139,0.4)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                        <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} style={inp} required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "rgba(99,102,241,0.25)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "12px", color: loading ? "rgba(255,255,255,0.4)" : "#fff", fontSize: "14.5px", fontWeight: "700", cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.35)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    {loading ? <><div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} /> Sending OTP…</> : "Send OTP →"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 2: Enter OTP ── */}
                    {step === 2 && (
                        <>
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                    <span style={{ fontSize: "24px" }}>📩</span>
                                </div>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: "#f0fdf4", marginBottom: "6px", letterSpacing: "-0.5px" }}>Check Your Email</h2>
                                <p style={{ fontSize: "13.5px", color: "rgba(100,116,139,0.65)", lineHeight: 1.6 }}>
                                    We sent a 6-digit OTP to <strong style={{ color: "#c4b5fd" }}>{email}</strong>. Enter it below.
                                </p>
                            </div>

                            {error && <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}><AlertCircle size={14} color="#f87171" /><span style={{ fontSize: "13px", color: "#fca5a5" }}>{error}</span></div>}
                            {success && <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}><CheckCircle size={14} color="#34d399" /><span style={{ fontSize: "13px", color: "#6ee7b7" }}>{success}</span></div>}

                            <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {/* OTP boxes */}
                                <div>
                                    <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase", textAlign: "center" }}>Enter OTP</label>
                                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }} onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => otpRefs.current[i] = el}
                                                className="otp-input"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                style={{
                                                    width: "48px", height: "56px", textAlign: "center",
                                                    fontSize: "22px", fontWeight: "800", color: digit ? "#c4b5fd" : "#e2e8f0",
                                                    background: digit ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
                                                    border: `1.5px solid ${digit ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.09)"}`,
                                                    borderRadius: "12px", outline: "none",
                                                    fontFamily: "monospace", caretColor: "#6366f1",
                                                    transition: "all 0.2s",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={loading || otp.join("").length !== 6} style={{ width: "100%", padding: "13px", background: loading || otp.join("").length !== 6 ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "12px", color: loading || otp.join("").length !== 6 ? "rgba(255,255,255,0.35)" : "#fff", fontSize: "14.5px", fontWeight: "700", cursor: loading || otp.join("").length !== 6 ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.3)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    {loading ? <><div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} /> Verifying…</> : "Verify OTP →"}
                                </button>

                                {/* Resend */}
                                <div style={{ textAlign: "center" }}>
                                    <span style={{ fontSize: "13px", color: "rgba(100,116,139,0.55)" }}>Didn't receive it? </span>
                                    <button type="button" onClick={handleResend} disabled={timer > 0 || loading} style={{ background: "none", border: "none", cursor: timer > 0 ? "default" : "pointer", color: timer > 0 ? "rgba(100,116,139,0.4)" : "#a5b4fc", fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans',sans-serif", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <RefreshCw size={12} />{timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ── STEP 3: New Password ── */}
                    {step === 3 && (
                        <>
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg,rgba(20,184,166,0.2),rgba(6,182,212,0.15))", border: "1px solid rgba(20,184,166,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                    <Lock size={22} color="#5eead4" />
                                </div>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: "#f0fdf4", marginBottom: "6px", letterSpacing: "-0.5px" }}>Set New Password</h2>
                                <p style={{ fontSize: "13.5px", color: "rgba(100,116,139,0.65)", lineHeight: 1.6 }}>Choose a strong password for your account.</p>
                            </div>

                            {error && <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}><AlertCircle size={14} color="#f87171" /><span style={{ fontSize: "13px", color: "#fca5a5" }}>{error}</span></div>}

                            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* New password */}
                                <div>
                                    <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>New Password</label>
                                    <div style={{ position: "relative" }}>
                                        <Lock size={15} color="rgba(100,116,139,0.4)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                        <input type={showPwd ? "text" : "password"} placeholder="Min 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={{ ...inp, paddingRight: "44px" }} required />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(100,116,139,0.5)", display: "flex", alignItems: "center" }}>
                                            {showPwd ? <Eye size={15} /> : <EyeOff size={15} />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {newPwd && (
                                        <div style={{ marginTop: "8px" }}>
                                            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i <= str.score ? str.color : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                                                ))}
                                            </div>
                                            {str.label && <span style={{ fontSize: "11px", color: str.color, fontWeight: "600" }}>{str.label}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", display: "block", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Confirm Password</label>
                                    <div style={{ position: "relative" }}>
                                        <Lock size={15} color="rgba(100,116,139,0.4)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                        <input type={showPwd ? "text" : "password"} placeholder="Re-enter password" value={confPwd} onChange={e => setConfPwd(e.target.value)}
                                            style={{ ...inp, paddingRight: "44px", borderColor: confPwd && confPwd !== newPwd ? "rgba(239,68,68,0.5)" : confPwd && confPwd === newPwd ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.09)" }} required />
                                        {confPwd && (
                                            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
                                                {confPwd === newPwd ? <CheckCircle size={15} color="#34d399" /> : <AlertCircle size={15} color="#f87171" />}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "rgba(20,184,166,0.25)" : "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "12px", color: loading ? "rgba(255,255,255,0.4)" : "#fff", fontSize: "14.5px", fontWeight: "700", cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: loading ? "none" : "0 4px 24px rgba(20,184,166,0.35)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    {loading ? <><div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} /> Resetting…</> : "Reset Password →"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 4: Success ── */}
                    {step === 4 && (
                        <div style={{ textAlign: "center", padding: "12px 0" }}>
                            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulse 2s ease-in-out infinite" }}>
                                <CheckCircle size={36} color="#34d399" />
                            </div>
                            <h2 style={{ fontSize: "24px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: "#f0fdf4", marginBottom: "10px", letterSpacing: "-0.5px" }}>Password Reset!</h2>
                            <p style={{ fontSize: "14px", color: "rgba(100,116,139,0.65)", lineHeight: 1.6, marginBottom: "28px" }}>
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <button onClick={() => navigate("/")} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14.5px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 24px rgba(20,184,166,0.35)" }}>
                                Go to Login →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}