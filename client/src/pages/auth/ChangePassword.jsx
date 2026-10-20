import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import API from "../../api/axios";

export default function ChangePassword() {
    const { user, logout } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const isMustChange = user?.mustChangePassword;

    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 4000); };

    const strength = (p) => {
        if (!p) return { score: 0, label: "", color: "" };
        if (p.length < 6) return { score: 1, label: "Too short", color: "#f87171" };
        if (p.length < 8) return { score: 2, label: "Weak", color: "#fbbf24" };
        if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { score: 4, label: "Strong", color: "#34d399" };
        return { score: 3, label: "Medium", color: "#67e8f9" };
    };
    const str = strength(form.newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.currentPassword) return notify("Current password is required.", "error");
        if (form.newPassword.length < 6) return notify("Password must be at least 6 characters.", "error");
        if (form.newPassword !== form.confirmPassword) return notify("Passwords do not match.", "error");
        setLoading(true);
        try {
            await API.post("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
            notify("Password changed successfully!");
            setTimeout(() => { if (isMustChange) { logout(); navigate("/"); } else navigate(-1); }, 1500);
        } catch (err) {
            notify(err.response?.data?.message || "Failed to change password.", "error");
        } finally { setLoading(false); }
    };

    // Theme
    const pageBg = isDark ? "linear-gradient(135deg,#0a0f1e,#0d1528,#0a1a2e)" : "#f0f4f8";
    const cardBg = isDark ? "rgba(13,21,40,0.95)" : "#ffffff";
    const cardBrd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    const cardShadow = isDark ? "0 30px 80px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.1)";
    const txtPrim = isDark ? "#f0fdf4" : "#0f172a";
    const txtMuted = isDark ? "rgba(148,163,184,0.7)" : "#64748b";
    const txtFaint = isDark ? "rgba(100,116,139,0.6)" : "#94a3b8";
    const inpBg = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
    const inpBrd = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
    const inpClr = isDark ? "#e2e8f0" : "#0f172a";
    const cancelBg = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9";
    const cancelBrd = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
    const cancelClr = isDark ? "rgba(148,163,184,0.7)" : "#64748b";
    const strBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    const inp = (key) => ({
        width: "100%", background: inpBg,
        border: `1px solid ${inpBrd}`,
        borderRadius: "11px", padding: "12px 44px 12px 14px",
        color: inpClr, fontSize: "14px",
        fontFamily: "'DM Sans',sans-serif", outline: "none",
    });

    const fields = [
        { key: "currentPassword", label: "CURRENT PASSWORD", showKey: "current", placeholder: "Enter current password" },
        { key: "newPassword", label: "NEW PASSWORD", showKey: "new", placeholder: "Min 6 characters" },
        { key: "confirmPassword", label: "CONFIRM PASSWORD", showKey: "confirm", placeholder: "Re-enter new password" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            <div style={{ width: "100%", maxWidth: "420px", animation: "fadeUp 0.4s ease" }}>

                {/* Back button */}
                {!isMustChange && (
                    <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: txtFaint, fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans',sans-serif", marginBottom: "20px", padding: 0, transition: "color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = isDark ? "#e2e8f0" : "#0f172a"}
                        onMouseLeave={e => e.currentTarget.style.color = txtFaint}
                    >
                        <ArrowLeft size={15} /> Back
                    </button>
                )}

                {/* Card */}
                <div style={{ background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: "24px", padding: "40px 36px", boxShadow: cardShadow }}>

                    {/* Icon */}
                    <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: isMustChange ? "rgba(245,158,11,0.12)" : "rgba(20,184,166,0.12)", border: `1px solid ${isMustChange ? "rgba(245,158,11,0.25)" : "rgba(20,184,166,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                        <Lock size={24} color={isMustChange ? "#fbbf24" : "#14b8a6"} />
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: txtPrim, marginBottom: "8px", letterSpacing: "-0.5px" }}>
                        {isMustChange ? "Set New Password" : "Change Password"}
                    </h1>
                    <p style={{ fontSize: "13.5px", color: txtMuted, marginBottom: "28px", lineHeight: 1.6 }}>
                        {isMustChange ? "You must set a new password before continuing." : "Update your account password below."}
                    </p>

                    {/* Toast */}
                    {msg.text && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>
                            {msg.type === "error" ? <AlertCircle size={14} color="#f87171" /> : <CheckCircle size={14} color="#34d399" />}
                            <span style={{ fontSize: "13px", color: msg.type === "error" ? "#fca5a5" : "#6ee7b7", fontWeight: "600" }}>{msg.text}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {fields.map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: "10px", fontWeight: "700", color: txtFaint, display: "block", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>{f.label}</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={show[f.showKey] ? "text" : "password"}
                                        placeholder={f.placeholder}
                                        value={form[f.key]}
                                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                        style={inp(f.key)}
                                    />
                                    <button type="button" onClick={() => setShow({ ...show, [f.showKey]: !show[f.showKey] })}
                                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: txtFaint, display: "flex", alignItems: "center" }}>
                                        {show[f.showKey] ? <Eye size={15} /> : <EyeOff size={15} />}
                                    </button>
                                </div>

                                {/* Strength bar for new password */}
                                {f.key === "newPassword" && form.newPassword && (
                                    <div style={{ marginTop: "8px" }}>
                                        <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i <= str.score ? str.color : strBg, transition: "background 0.3s" }} />
                                            ))}
                                        </div>
                                        {str.label && <span style={{ fontSize: "11px", color: str.color, fontWeight: "600" }}>{str.label}</span>}
                                    </div>
                                )}

                                {/* Match indicator for confirm */}
                                {f.key === "confirmPassword" && form.confirmPassword && (
                                    <div style={{ marginTop: "6px", fontSize: "11px", fontWeight: "600", color: form.confirmPassword === form.newPassword ? "#34d399" : "#f87171" }}>
                                        {form.confirmPassword === form.newPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "rgba(20,184,166,0.3)" : "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "12px", color: loading ? "rgba(255,255,255,0.5)" : "#fff", fontSize: "14.5px", fontWeight: "700", cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: loading ? "none" : "0 4px 20px rgba(20,184,166,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}>
                            {loading ? <><div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />Saving…</> : "Change Password →"}
                        </button>

                        {/* Cancel */}
                        {!isMustChange && (
                            <button type="button" onClick={() => navigate(-1)} style={{ width: "100%", padding: "12px", background: cancelBg, border: `1px solid ${cancelBrd}`, borderRadius: "12px", color: cancelClr, fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                                Cancel
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}