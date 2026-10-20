import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import API from "../../api/axios";
import { User, Mail, Phone, Building2, Shield, CheckCircle, AlertCircle, Edit3, Save, X, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLE_CFG = {
    admin: { color: "#14b8a6", bg: "rgba(20,184,166,0.1)", label: "Super Admin" },
    manager: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", label: "Manager" },
    employee: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Employee" },
};

const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "" });
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        API.get("/employees/profile")
            .then(res => { setProfile(res.data); setForm({ name: res.data.name || "", phone: res.data.phone || "" }); })
            .catch(console.error);
    }, []);

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3500); };

    const handleSave = async () => {
        if (!form.name.trim()) return notify("Name cannot be empty.", "error");
        setSaving(true);
        try {
            const res = await API.put("/employees/profile", form);
            updateUser({ ...user, name: res.data.name });
            setProfile(res.data);
            setEditing(false);
            notify("Profile updated!");
        } catch { notify("Failed to update.", "error"); }
        finally { setSaving(false); }
    };

    const role = user?.role || "employee";
    const roleCfg = ROLE_CFG[role] || ROLE_CFG.employee;
    const displayData = profile || user;

    // Theme colors
    const pageBg = isDark ? "linear-gradient(135deg,#0a0f1e,#0d1528)" : "#f0f4f8";
    const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
    const cardBrd = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const cardShadow = isDark ? "none" : "0 2px 12px rgba(0,0,0,0.07)";
    const txtPrim = isDark ? "#f0fdf4" : "#0f172a";
    const txtSec = isDark ? "#e2e8f0" : "#1e293b";
    const txtMuted = isDark ? "rgba(148,163,184,0.8)" : "#64748b";
    const txtFaint = isDark ? "rgba(100,116,139,0.6)" : "#94a3b8";
    const iconBg = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9";
    const iconBrd = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";

    const inp = {
        width: "100%",
        background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
        borderRadius: "10px", padding: "11px 14px",
        color: isDark ? "#e2e8f0" : "#0f172a",
        fontSize: "14px", fontFamily: "'DM Sans',sans-serif", outline: "none",
    };

    return (
        <div style={{ minHeight: "100vh", background: pageBg, padding: "40px 20px", fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}input:focus{border-color:rgba(20,184,166,0.45)!important;outline:none!important}`}</style>

            <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Back */}
                <button onClick={() => navigate(-1)} style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", color: txtFaint, fontSize: "13px", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: "6px", padding: "0" }}>
                    ← Back
                </button>

                {/* Profile header card */}
                <div style={{ background: isDark ? "linear-gradient(135deg,rgba(6,182,212,0.06),rgba(99,102,241,0.04))" : "#ffffff", border: `1px solid ${isDark ? "rgba(6,182,212,0.12)" : "rgba(0,0,0,0.08)"}`, borderRadius: "16px", padding: "32px", boxShadow: cardShadow }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            <div style={{ width: "72px", height: "72px", borderRadius: "18px", background: `linear-gradient(135deg,${roleCfg.color}40,${roleCfg.color}20)`, border: `2px solid ${roleCfg.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "800", color: roleCfg.color, fontFamily: "'DM Serif Display',serif", flexShrink: 0 }}>
                                {getInitials(displayData?.name)}
                            </div>
                            <div>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", color: txtPrim, fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", marginBottom: "6px" }}>{displayData?.name}</h2>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: roleCfg.color, background: roleCfg.bg, padding: "3px 10px", borderRadius: "20px", textTransform: "capitalize" }}>{roleCfg.label}</span>
                            </div>
                        </div>
                        <button onClick={() => setEditing(!editing)} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: editing ? "rgba(239,68,68,0.08)" : isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", color: editing ? "#f87171" : txtMuted, fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                            {editing ? <><X size={14} />Cancel</> : <><Edit3 size={14} />Edit</>}
                        </button>
                    </div>
                </div>

                {/* Toast */}
                {msg.text && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "12px", background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>
                        {msg.type === "error" ? <AlertCircle size={16} color="#f87171" /> : <CheckCircle size={16} color="#34d399" />}
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: msg.type === "error" ? "#fca5a5" : "#6ee7b7" }}>{msg.text}</span>
                    </div>
                )}

                {/* Details card */}
                <div style={{ background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: "16px", padding: "28px 32px", boxShadow: cardShadow }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "700", color: txtPrim, marginBottom: "20px", letterSpacing: "0.3px" }}>Profile Information</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {[
                            { icon: User, label: "Full Name", key: "name", editable: true, value: displayData?.name || "—" },
                            { icon: Mail, label: "Email", key: "email", editable: false, value: displayData?.email || "—" },
                            { icon: Phone, label: "Phone", key: "phone", editable: true, value: displayData?.phone || "—" },
                            { icon: Building2, label: "Department", key: "dept", editable: false, value: displayData?.departmentId?.name || "Not Assigned" },
                            { icon: Shield, label: "Role", key: "role", editable: false, value: roleCfg.label },
                        ].map(({ icon: Icon, label, key, editable, value }) => (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: iconBg, border: `1px solid ${iconBrd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={16} color={txtFaint} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "11px", fontWeight: "600", color: txtFaint, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
                                    {editing && editable ? (
                                        <input style={inp} value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={`Enter ${label.toLowerCase()}`} />
                                    ) : (
                                        <div style={{ fontSize: "14px", fontWeight: "500", color: editable ? txtSec : txtMuted }}>{value}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {editing && (
                        <button onClick={handleSave} disabled={saving} style={{ width: "100%", marginTop: "24px", padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: saving ? "rgba(20,184,166,0.3)" : "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "12px", color: saving ? "rgba(255,255,255,0.5)" : "#fff", fontSize: "14px", fontWeight: "700", cursor: saving ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: saving ? "none" : "0 4px 20px rgba(20,184,166,0.3)" }}>
                            <Save size={16} />{saving ? "Saving…" : "Save Changes"}
                        </button>
                    )}
                </div>

                {/* Change password */}
                <button onClick={() => navigate("/change-password")} style={{ background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: "16px", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.15s", width: "100%", boxShadow: cardShadow }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#f8fafc"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = cardBrd; }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Lock size={16} color="#a5b4fc" />
                        </div>
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: txtSec }}>Change Password</div>
                            <div style={{ fontSize: "12px", color: txtFaint }}>Update your account password</div>
                        </div>
                    </div>
                    <span style={{ fontSize: "18px", color: txtFaint }}>→</span>
                </button>
            </div>
        </div>
    );
}