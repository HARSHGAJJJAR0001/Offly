import { useState, useEffect } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import API from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, CheckCircle, XCircle, Plus, ArrowRight } from "lucide-react";
import { SkeletonCard, SkeletonHeader } from "../../components/Skeleton";
import { useNavigate } from "react-router-dom";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };

const STATUS_CFG = {
    pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Pending", icon: Clock },
    approved: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Approved", icon: CheckCircle },
    rejected: { color: "#f43f5e", bg: "rgba(244,63,94,0.1)", label: "Rejected", icon: XCircle },
};

export default function EmployeeDashboard() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/leaves/my")
            .then(res => setLeaves(res.data?.data || res.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const pending = leaves.filter(l => l.status === "pending").length;
    const approved = leaves.filter(l => l.status === "approved").length;
    const rejected = leaves.filter(l => l.status === "rejected").length;

    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

    return (
        <EmployeeLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');`}</style>
            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Hero */}
                <div style={{ ...glass, padding: "28px 32px", background: "var(--bg-glass)", border: "1px solid var(--border-color)" }}>
                    <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", marginBottom: "8px", color: isDark ? "#f0fdf4" : "#0f172a" }}>
                        Welcome, <span style={{ color: isDark ? "#67e8f9" : "#0f766e" }}>{user?.name?.split(" ")[0]}</span> 👋
                    </h1>
                    <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>
                        Department: <strong style={{ color: "#67e8f9" }}>{user?.departmentId?.name || "Not Assigned"}</strong>
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "14px" }}>
                    {[
                        { label: "Total Leaves", value: leaves.length, color: "#67e8f9", icon: Calendar },
                        { label: "Pending", value: pending, color: "#fbbf24", icon: Clock },
                        { label: "Approved", value: approved, color: "#34d399", icon: CheckCircle },
                        { label: "Rejected", value: rejected, color: "#f87171", icon: XCircle },
                    ].map(({ label, value, color, icon: Icon }) => (
                        <div key={label} style={{ ...glass, padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: "22px", fontWeight: "800", color, fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{value}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500", marginTop: "2px" }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {[
                        { label: "Apply for Leave", icon: Plus, color: "#14b8a6", href: "/employee/apply-leave", primary: true },
                        { label: "My Leave History", icon: Calendar, color: "#8b5cf6", href: "/employee/my-leaves", primary: false },
                    ].map(({ label, icon: Icon, color, href, primary }) => (
                        <button key={label} onClick={() => navigate(href)} style={{
                            ...glass, padding: "22px", cursor: "pointer",
                            background: primary ? `linear-gradient(135deg,${color}20,${color}10)` : `${color}08`,
                            border: `1px solid ${color}${primary ? "35" : "20"}`,
                            display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 30px ${color}25`; e.currentTarget.style.borderColor = `${color}50`; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${color}${primary ? "35" : "20"}`; }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${color}20`, border: `1px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={20} color={color} />
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)" }}>{label}</span>
                            </div>
                            <ArrowRight size={16} color={color} />
                        </button>
                    ))}
                </div>

                {/* Recent leaves */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Recent Requests</h2>
                        <button onClick={() => navigate("/employee/my-leaves")} style={{ fontSize: "12px", color: "rgba(103,232,249,0.7)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>View All →</button>
                    </div>
                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-faint)", fontSize: "14px" }}>Loading…</div>
                    ) : leaves.length === 0 ? (
                        <div style={{ ...glass, padding: "40px", textAlign: "center" }}>
                            <Calendar size={36} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} />
                            <div style={{ color: "var(--text-faint)", fontSize: "14px", marginBottom: "16px" }}>No leave requests yet.</div>
                            <button onClick={() => navigate("/employee/apply-leave")} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                                Apply for Leave
                            </button>
                        </div>
                    ) : (
                        <div style={{ ...glass, overflow: "hidden" }}>
                            {leaves.slice(0, 5).map((l, i) => {
                                const cfg = STATUS_CFG[l.status] || STATUS_CFG.pending;
                                const Icon = cfg.icon;
                                return (
                                    <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div>
                                            <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "3px", textTransform: "capitalize" }}>{l.leaveType} Leave</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-faint)" }}>{fmt(l.startDate)} – {fmt(l.endDate)}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                            <Icon size={11} />{cfg.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}