import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import API from "../../api/axios";
import { Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };

const LEAVE_TYPES = ["sick", "casual", "earned", "maternity", "paternity", "other"];

export default function ApplyLeave() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [form, setForm] = useState({ leaveType: "casual", startDate: "", endDate: "", reason: "" });
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [submitting, setSubmitting] = useState(false);

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 4000); };

    const getDays = () => {
        if (!form.startDate || !form.endDate) return 0;
        const diff = Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1;
        return diff > 0 ? diff : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.startDate || !form.endDate) return notify("Please select start and end dates.", "error");
        if (new Date(form.endDate) < new Date(form.startDate)) return notify("End date cannot be before start date.", "error");
        if (!form.reason.trim()) return notify("Please provide a reason.", "error");

        setSubmitting(true);
        try {
            await API.post("/leaves", form);
            notify("Leave request submitted successfully!");
            setTimeout(() => navigate("/employee/my-leaves"), 1500);
        } catch (err) {
            notify(err.response?.data?.message || "Failed to submit. Try again.", "error");
        } finally { setSubmitting(false); }
    };

    const inp = {
        width: "100%", background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", padding: "12px 14px", color: "var(--text-secondary)", fontSize: "14px",
        fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "border-color 0.2s",
    };

    return (
        <EmployeeLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}input:focus,select:focus,textarea:focus{border-color:rgba(20,184,166,0.45)!important;box-shadow:0 0 0 3px rgba(20,184,166,0.08)!important;outline:none!important}select option{background:#0d1528;color:#e2e8f0}`}</style>

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "640px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(20,184,166,0.08),rgba(6,182,212,0.05))", border: "1px solid rgba(20,184,166,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(20,184,166,0.2),rgba(6,182,212,0.15))", border: "1px solid rgba(20,184,166,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Calendar size={20} color="#5eead4" />
                        </div>
                        <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#5eead4" : "#0f766e" }}>Apply for Leave</h1>
                    </div>
                    <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>Fill in the details below. Your manager will review your request.</p>
                </div>

                {/* Toast */}
                {msg.text && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "12px", background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>
                        {msg.type === "error" ? <AlertCircle size={16} color="#f87171" /> : <CheckCircle size={16} color="#34d399" />}
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: msg.type === "error" ? "#fca5a5" : "#6ee7b7" }}>{msg.text}</span>
                    </div>
                )}

                {/* Form */}
                <div style={{ ...glass, padding: "28px 32px" }}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Leave type */}
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-faint)", display: "block", marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Leave Type *</label>
                            <select style={{ ...inp, cursor: "pointer", textTransform: "capitalize" }} value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                                {LEAVE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>

                        {/* Dates */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-faint)", display: "block", marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Start Date *</label>
                                <input type="date" style={{ ...inp, colorScheme: "dark" }} value={form.startDate} min={new Date().toISOString().split("T")[0]} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-faint)", display: "block", marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>End Date *</label>
                                <input type="date" style={{ ...inp, colorScheme: "dark" }} value={form.endDate} min={form.startDate || new Date().toISOString().split("T")[0]} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                            </div>
                        </div>

                        {/* Duration indicator */}
                        {getDays() > 0 && (
                            <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
                                <Calendar size={16} color="#5eead4" />
                                <span style={{ fontSize: "13.5px", color: "#5eead4", fontWeight: "600" }}>
                                    Duration: <strong>{getDays()} day{getDays() !== 1 ? "s" : ""}</strong>
                                </span>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-faint)", display: "block", marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Reason *</label>
                            <textarea
                                rows={4}
                                style={{ ...inp, resize: "vertical", minHeight: "100px" }}
                                placeholder="Please describe the reason for your leave request…"
                                value={form.reason}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                                required
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                            <button type="submit" disabled={submitting} style={{
                                flex: 1, padding: "13px", background: submitting ? "rgba(20,184,166,0.3)" : "linear-gradient(135deg,#14b8a6,#06b6d4)",
                                border: "none", borderRadius: "12px", color: submitting ? "rgba(255,255,255,0.5)" : "#fff",
                                fontSize: "14.5px", fontWeight: "700", cursor: submitting ? "default" : "pointer",
                                fontFamily: "'DM Sans',sans-serif", boxShadow: submitting ? "none" : "0 4px 20px rgba(20,184,166,0.3)",
                                transition: "all 0.2s",
                            }}>
                                {submitting ? "Submitting…" : "Submit Request"}
                            </button>
                            <button type="button" onClick={() => navigate("/employee")} style={{
                                padding: "13px 20px", background: "var(--bg-input)", border: "1px solid var(--border-color)",
                                borderRadius: "12px", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600",
                                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </EmployeeLayout>
    );
}