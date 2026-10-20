import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import API from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import { Calendar, Search, CheckCircle, XCircle, Clock, AlertCircle, X, User } from "lucide-react";

const glass = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", backdropFilter: "blur(12px)" };
const STATUS_CFG = {
    pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Pending", icon: Clock },
    approved: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", label: "Approved", icon: CheckCircle },
    rejected: { color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.25)", label: "Rejected", icon: XCircle },
};
const Badge = ({ status }) => { const c = STATUS_CFG[status] || STATUS_CFG.pending; const I = c.icon; return (<span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}><I size={11} />{c.label}</span>); };

export default function ManagerLeaveRequests() {
    const { isDark } = useTheme();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [updating, setUpdating] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, id: null, action: "", name: "" });

    const fetchLeaves = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.append("status", statusFilter);
            const res = await API.get(`/leaves?${params}`);
            setLeaves(res.data?.data || res.data || []);
        } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchLeaves(); }, [statusFilter]);

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3500); };

    const handleConfirm = async () => {
        const { id, action } = confirm;
        setUpdating(id + action);
        setConfirm({ open: false, id: null, action: "", name: "" });
        try {
            await API.patch(`/leaves/${id}`, { status: action });
            notify(`Leave ${action}!`);
            fetchLeaves();
        } catch { notify("Failed.", "error"); }
        finally { setUpdating(null); }
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const days = (s, e) => { if (!s || !e) return "—"; const d = Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1; return `${d}d`; };
    const filtered = leaves.filter(l => (l.userId?.name || "").toLowerCase().includes(search.toLowerCase()));
    const counts = { all: leaves.length, pending: leaves.filter(l => l.status === "pending").length, approved: leaves.filter(l => l.status === "approved").length, rejected: leaves.filter(l => l.status === "rejected").length };

    return (
        <ManagerLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}.leave-row:hover{background:rgba(255,255,255,0.04)!important}input:focus{outline:none}`}</style>
            <ConfirmModal open={confirm.open} title={confirm.action === "approved" ? "Approve Leave?" : "Reject Leave?"} message={`${confirm.action === "approved" ? "Approve" : "Reject"} leave for "${confirm.name}"?`} onConfirm={handleConfirm} onCancel={() => setConfirm({ open: false, id: null, action: "", name: "" })} danger={confirm.action === "rejected"} />
            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(239,68,68,0.04))", border: "1px solid rgba(245,158,11,0.13)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Calendar size={20} color="#fbbf24" /></div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#fcd34d" : "#b45309" }}>Leave Requests</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>Review and manage your team's leave requests</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px", minWidth: "220px" }}>
                        <Search size={15} color="rgba(100,116,139,0.6)" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee…" style={{ background: "none", border: "none", outline: "none", color: "var(--text-secondary)", fontSize: "13px", width: "100%", fontFamily: "'DM Sans',sans-serif" }} />
                        {search && <X size={13} style={{ cursor: "pointer", color: "var(--text-faint)" }} onClick={() => setSearch("")} />}
                    </div>
                </div>
                {msg.text && (<div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "12px", background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>{msg.type === "error" ? <AlertCircle size={16} color="#f87171" /> : <CheckCircle size={16} color="#34d399" />}<span style={{ fontSize: "13.5px", fontWeight: "600", color: msg.type === "error" ? "#fca5a5" : "#6ee7b7" }}>{msg.text}</span></div>)}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[{ key: "all", label: "All", color: "var(--text-secondary)" }, { key: "pending", label: "Pending", color: "#fbbf24" }, { key: "approved", label: "Approved", color: "#34d399" }, { key: "rejected", label: "Rejected", color: "#f87171" }].map(t => (
                        <button key={t.key} onClick={() => setStatusFilter(t.key)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "10px", cursor: "pointer", border: `1px solid ${statusFilter === t.key ? t.color + "30" : "rgba(255,255,255,0.07)"}`, background: statusFilter === t.key ? t.color + "0e" : "rgba(255,255,255,0.03)", color: statusFilter === t.key ? t.color : "var(--text-faint)", fontSize: "13px", fontWeight: "600", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" }}>
                            {t.label}<span style={{ padding: "1px 7px", borderRadius: "99px", fontSize: "11px", background: statusFilter === t.key ? t.color + "20" : "rgba(255,255,255,0.05)", color: statusFilter === t.key ? t.color : "var(--text-faint)", fontWeight: "700" }}>{counts[t.key]}</span>
                        </button>
                    ))}
                </div>
                {loading ? (<div style={{ padding: "60px", textAlign: "center", color: "var(--text-faint)" }}>Loading…</div>) : filtered.length === 0 ? (<div style={{ ...glass, padding: "60px", textAlign: "center" }}><Calendar size={40} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} /><div style={{ color: "var(--text-faint)", fontSize: "14px" }}>No leave requests found.</div></div>) : (
                    <div className="table-scroll" style={{ ...glass, overflow: "auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 110px 70px 130px 160px", padding: "13px 20px", borderBottom: "1px solid var(--divider)", background: "rgba(255,255,255,0.02)", minWidth: "800px" }}>
                            {["#", "Employee", "Start", "End", "Days", "Status", "Actions"].map((h, i) => (<span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.55)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</span>))}
                        </div>
                        {filtered.map((leave, i) => (
                            <div key={leave._id} className="leave-row" style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 110px 70px 130px 160px", padding: "15px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.035)", transition: "background 0.15s", minWidth: "800px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(100,116,139,0.4)" }}>{String(i + 1).padStart(2, "0")}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><User size={14} color="#fbbf24" /></div>
                                    <div>
                                        <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)" }}>{leave.userId?.name || "Unknown"}</div>
                                        {leave.reason && <div style={{ fontSize: "11px", color: "var(--text-faint)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leave.reason}</div>}
                                    </div>
                                </div>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{fmt(leave.startDate)}</span>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{fmt(leave.endDate)}</span>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#fbbf24" }}>{days(leave.startDate, leave.endDate)}</span>
                                <Badge status={leave.status} />
                                <div style={{ display: "flex", gap: "6px" }}>
                                    {leave.status === "pending" && (<>
                                        <button disabled={!!updating} onClick={() => setConfirm({ open: true, id: leave._id, action: "approved", name: leave.userId?.name })} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "7px", padding: "6px 10px", color: "#34d399", fontSize: "11.5px", fontWeight: "600", cursor: updating ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }} onMouseEnter={e => !updating && (e.currentTarget.style.background = "rgba(16,185,129,0.2)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}><CheckCircle size={12} />Approve</button>
                                        <button disabled={!!updating} onClick={() => setConfirm({ open: true, id: leave._id, action: "rejected", name: leave.userId?.name })} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "7px", padding: "6px 10px", color: "#f87171", fontSize: "11.5px", fontWeight: "600", cursor: updating ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }} onMouseEnter={e => !updating && (e.currentTarget.style.background = "rgba(244,63,94,0.2)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(244,63,94,0.1)")}><XCircle size={12} />Reject</button>
                                    </>)}
                                    {leave.status !== "pending" && <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>by {leave.reviewedBy?.name || "—"}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ManagerLayout>
    );
}