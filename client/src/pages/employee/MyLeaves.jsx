import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import API from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import { Calendar, Plus, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from "lucide-react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };

const STATUS_CFG = {
    pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Pending", icon: Clock },
    approved: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", label: "Approved", icon: CheckCircle },
    rejected: { color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.25)", label: "Rejected", icon: XCircle },
};

export default function MyLeaves() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [leaves, setLeaves] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [confirm, setConfirm] = useState({ open: false, id: null });

    const fetchLeaves = (pg = page) => {
        setLoading(true);
        API.get(`/leaves/my?page=${pg}&limit=10`)
            .then(res => { setLeaves(res.data.data); setPagination(res.data.pagination); })
            .catch(() => notify("Failed to load leaves.", "error"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchLeaves(); }, []);

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3500); };

    const handleDelete = async () => {
        try {
            await API.delete(`/leaves/${confirm.id}`);
            notify("Leave request cancelled.");
            fetchLeaves();
        } catch (err) {
            notify(err.response?.data?.message || "Failed to cancel.", "error");
        } finally { setConfirm({ open: false, id: null }); }
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const getDays = (s, e) => {
        if (!s || !e) return "—";
        const d = Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
        return `${d} day${d !== 1 ? "s" : ""}`;
    };

    const counts = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === "pending").length,
        approved: leaves.filter(l => l.status === "approved").length,
        rejected: leaves.filter(l => l.status === "rejected").length,
    };

    return (
        <EmployeeLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}.leave-card:hover{background:rgba(255,255,255,0.05)!important}`}</style>

            <ConfirmModal
                open={confirm.open}
                title="Cancel Leave Request"
                message="Are you sure you want to cancel this leave request?"
                onConfirm={handleDelete}
                onCancel={() => setConfirm({ open: false, id: null })}
            />

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.05))", border: "1px solid rgba(139,92,246,0.15)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.15))", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Calendar size={20} color="#c4b5fd" />
                            </div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#c4b5fd" : "#6d28d9" }}>My Leaves</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>Your leave request history</p>
                    </div>
                    <button onClick={() => navigate("/employee/apply-leave")} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: "10px", padding: "10px 18px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(139,92,246,0.35)", fontFamily: "'DM Sans',sans-serif" }}>
                        <Plus size={16} /> New Request
                    </button>
                </div>

                {/* Toast */}
                {msg.text && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "12px", background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>
                        {msg.type === "error" ? <AlertCircle size={16} color="#f87171" /> : <CheckCircle size={16} color="#34d399" />}
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: msg.type === "error" ? "#fca5a5" : "#6ee7b7" }}>{msg.text}</span>
                    </div>
                )}

                {/* Summary */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {[
                        { label: "Total", value: counts.total, color: "var(--text-secondary)" },
                        { label: "Pending", value: counts.pending, color: "#fbbf24" },
                        { label: "Approved", value: counts.approved, color: "#34d399" },
                        { label: "Rejected", value: counts.rejected, color: "#f87171" },
                    ].map(s => (
                        <div key={s.label} style={{ ...glass, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "100px" }}>
                            <span style={{ fontSize: "22px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif" }}>{s.value}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500" }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Leave cards */}
                {loading ? (
                    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-faint)" }}>Loading…</div>
                ) : leaves.length === 0 ? (
                    <div style={{ ...glass, padding: "60px", textAlign: "center" }}>
                        <Calendar size={40} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} />
                        <div style={{ color: "var(--text-faint)", fontSize: "14px", marginBottom: "16px" }}>No leave requests yet.</div>
                        <button onClick={() => navigate("/employee/apply-leave")} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                            Apply Now
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {leaves.map((l) => {
                            const cfg = STATUS_CFG[l.status] || STATUS_CFG.pending;
                            const Icon = cfg.icon;
                            return (
                                <div key={l._id} className="leave-card" style={{ ...glass, padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center", transition: "background 0.15s" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon size={18} color={cfg.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px", textTransform: "capitalize" }}>{l.leaveType} Leave</div>
                                            <div style={{ fontSize: "12px", color: "rgba(100,116,139,0.65)" }}>
                                                {fmt(l.startDate)} – {fmt(l.endDate)} · {getDays(l.startDate, l.endDate)}
                                            </div>
                                            {l.reason && <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "3px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.reason}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                            <Icon size={11} />{cfg.label}
                                        </span>
                                        {l.status === "pending" && (
                                            <button onClick={() => setConfirm({ open: true, id: l._id })} style={{ width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "9px", cursor: "pointer", color: "rgba(248,113,113,0.7)", transition: "all 0.15s" }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(248,113,113,0.7)"; }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination && <Pagination pagination={pagination} onPageChange={(pg) => { setPage(pg); fetchLeaves(pg); }} />}
            </div>
        </EmployeeLayout>
    );
}