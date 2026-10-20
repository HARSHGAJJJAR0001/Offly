import { exportLeavesToExcel, exportLeavesToPDF } from "../../utils/exportUtils";
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KEYS } from "../../hooks/queryKeys";
import ConfirmModal from "../../components/ConfirmModal";
import { Calendar, Search, CheckCircle, XCircle, Clock, AlertCircle, X, User } from "lucide-react";
import Pagination from "../../components/Pagination";
import { SkeletonTable } from "../../components/Skeleton";
import ExportMenu from "../../components/ExportMenu";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };

const STATUS_CFG = {
    pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Pending", icon: Clock },
    approved: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", label: "Approved", icon: CheckCircle },
    rejected: { color: "#f43f5e", bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.25)", label: "Rejected", icon: XCircle },
};

function Badge({ status }) {
    const c = STATUS_CFG[status] || STATUS_CFG.pending;
    const Icon = c.icon;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
            <Icon size={11} />{c.label}
        </span>
    );
}

export default function AdminLeaveRequests() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [updating, setUpdating] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, id: null, action: "", name: "" });
    const { isDark } = useTheme();
    const qc = useQueryClient();
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type) => {
        setExporting(true);
        try {
            const res = await API.get("/leaves?limit=10000");
            const all = res.data?.data || res.data || [];
            if (type === "excel") exportLeavesToExcel(all);
            else exportLeavesToPDF(all);
        } catch (e) { console.error("Export error:", e); alert("Export failed."); }
        finally { setExporting(false); }
    };

    const leavesParams = new URLSearchParams({ page, limit: 10 });
    if (statusFilter !== "all") leavesParams.append("status", statusFilter);
    if (search) leavesParams.append("search", search);

    const { data: leavesData, isLoading: loading } = useQuery({
        queryKey: KEYS.leaves({ page, status: statusFilter, search }),
        queryFn: () => API.get(`/leaves?${leavesParams}`).then(r => r.data),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 30,
    });

    const leaves = leavesData?.data || [];
    const pagination = leavesData?.pagination || null;

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3500); };

    const handleConfirm = async () => {
        const { id, action } = confirm;
        setUpdating(id + action);
        setConfirm({ open: false, id: null, action: "", name: "" });
        try {
            await API.patch(`/leaves/${id}`, { status: action });
            notify(`Leave ${action} successfully!`);
            qc.invalidateQueries({ queryKey: ["leaves"] });
            qc.invalidateQueries({ queryKey: ["admin", "stats"] });
        } catch { notify("Failed to update.", "error"); }
        finally { setUpdating(null); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
    const getDays = (s, e) => {
        if (!s || !e) return "—";
        const diff = Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
        return `${diff}d`;
    };

    const filtered = leaves.filter(l => {
        const name = l.userId?.name || "";
        return name.toLowerCase().includes(search.toLowerCase());
    });

    const counts = {
        all: leaves.length,
        pending: leaves.filter(l => l.status === "pending").length,
        approved: leaves.filter(l => l.status === "approved").length,
        rejected: leaves.filter(l => l.status === "rejected").length,
    };

    return (
        <AdminLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}.leave-row:hover{background:rgba(255,255,255,0.04)!important}input:focus{outline:none;border-color:rgba(245,158,11,0.4)!important}`}</style>

            <ConfirmModal
                open={confirm.open}
                title={confirm.action === "approved" ? "Approve Leave?" : "Reject Leave?"}
                message={`${confirm.action === "approved" ? "Approve" : "Reject"} leave request for "${confirm.name}"?`}
                onConfirm={handleConfirm}
                onCancel={() => setConfirm({ open: false, id: null, action: "", name: "" })}
                danger={confirm.action === "rejected"}
            />

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(245,158,11,0.07),rgba(239,68,68,0.04))", border: "1px solid rgba(245,158,11,0.13)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Calendar size={20} color="#fbbf24" />
                            </div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#fcd34d" : "#b45309" }}>Leave Requests</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>Review and manage employee time-off requests</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ExportMenu
                            onExportExcel={() => handleExport("excel")}
                            onExportPDF={() => handleExport("pdf")}
                            label={exporting ? "Exporting…" : "Export"}
                            disabled={leaves.length === 0 || exporting}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px", minWidth: "220px" }}>
                            <Search size={15} color="rgba(100,116,139,0.6)" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee…" style={{ background: "none", border: "none", outline: "none", color: "var(--text-secondary)", fontSize: "13px", width: "100%", fontFamily: "'DM Sans',sans-serif" }} />
                            {search && <X size={13} style={{ cursor: "pointer", color: "var(--text-faint)" }} onClick={() => setSearch("")} />}
                        </div>
                    </div>
                </div>

                {/* Toast */}
                {msg.text && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "12px", background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}` }}>
                        {msg.type === "error" ? <AlertCircle size={16} color="#f87171" /> : <CheckCircle size={16} color="#34d399" />}
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: msg.type === "error" ? "#fca5a5" : "#6ee7b7" }}>{msg.text}</span>
                    </div>
                )}

                {/* Status tabs */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                        { key: "all", label: "All", color: "var(--text-secondary)" },
                        { key: "pending", label: "Pending", color: "#fbbf24" },
                        { key: "approved", label: "Approved", color: "#34d399" },
                        { key: "rejected", label: "Rejected", color: "#f87171" },
                    ].map(t => (
                        <button key={t.key} onClick={() => setStatusFilter(t.key)} style={{
                            display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "10px",
                            cursor: "pointer", border: `1px solid ${statusFilter === t.key ? t.color + "30" : "rgba(255,255,255,0.07)"}`,
                            background: statusFilter === t.key ? t.color + "0e" : "rgba(255,255,255,0.03)",
                            color: statusFilter === t.key ? t.color : "rgba(100,116,139,0.7)",
                            fontSize: "13px", fontWeight: "600", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif",
                        }}>
                            {t.label}
                            <span style={{ padding: "1px 7px", borderRadius: "99px", fontSize: "11px", background: statusFilter === t.key ? t.color + "20" : "rgba(255,255,255,0.05)", color: statusFilter === t.key ? t.color : "rgba(100,116,139,0.5)", fontWeight: "700" }}>{counts[t.key]}</span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <SkeletonTable rows={6} cols={6} />
                ) : filtered.length === 0 ? (
                    <div style={{ ...glass, padding: "60px", textAlign: "center" }}>
                        <Calendar size={40} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} />
                        <div style={{ color: "var(--text-faint)", fontSize: "14px" }}>No leave requests found.</div>
                    </div>
                ) : (
                    <div style={{ ...glass, overflow: "auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 110px 70px 130px 160px", padding: "13px 20px", borderBottom: "1px solid var(--divider)", background: "rgba(255,255,255,0.02)", minWidth: "800px" }}>
                            {["#", "Employee", "Start", "End", "Days", "Status", "Actions"].map((h, i) => (
                                <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.55)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</span>
                            ))}
                        </div>
                        {filtered.map((leave, i) => (
                            <div key={leave._id} className="leave-row" style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 110px 70px 130px 160px", padding: "15px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.035)", transition: "background 0.15s", minWidth: "800px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(100,116,139,0.4)" }}>{String(i + 1).padStart(2, "0")}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <User size={14} color="#fbbf24" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)" }}>{leave.userId?.name || "Unknown"}</div>
                                        {leave.reason && <div style={{ fontSize: "11px", color: "var(--text-faint)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leave.reason}</div>}
                                    </div>
                                </div>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{formatDate(leave.startDate)}</span>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{formatDate(leave.endDate)}</span>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#fbbf24" }}>{getDays(leave.startDate, leave.endDate)}</span>
                                <Badge status={leave.status} />
                                <div style={{ display: "flex", gap: "6px" }}>
                                    {leave.status === "pending" && (
                                        <>
                                            <button disabled={!!updating} onClick={() => setConfirm({ open: true, id: leave._id, action: "approved", name: leave.userId?.name })} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "7px", padding: "6px 10px", color: "#34d399", fontSize: "11.5px", fontWeight: "600", cursor: updating ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                                                onMouseEnter={e => !updating && (e.currentTarget.style.background = "rgba(16,185,129,0.2)")}
                                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}
                                            ><CheckCircle size={12} />Approve</button>
                                            <button disabled={!!updating} onClick={() => setConfirm({ open: true, id: leave._id, action: "rejected", name: leave.userId?.name })} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "7px", padding: "6px 10px", color: "#f87171", fontSize: "11.5px", fontWeight: "600", cursor: updating ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                                                onMouseEnter={e => !updating && (e.currentTarget.style.background = "rgba(244,63,94,0.2)")}
                                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(244,63,94,0.1)")}
                                            ><XCircle size={12} />Reject</button>
                                        </>
                                    )}
                                    {leave.status !== "pending" && (
                                        <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                                            by {leave.reviewedBy?.name || "—"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && <Pagination pagination={pagination} onPageChange={(pg) => setPage(pg)} />}

                {/* Summary */}
                {leaves.length > 0 && (
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {[
                            { label: "Total", value: counts.all, color: "var(--text-secondary)" },
                            { label: "Pending", value: counts.pending, color: "#fbbf24" },
                            { label: "Approved", value: counts.approved, color: "#34d399" },
                            { label: "Rejected", value: counts.rejected, color: "#f87171" },
                        ].map(s => (
                            <div key={s.label} style={{ ...glass, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "110px" }}>
                                <span style={{ fontSize: "22px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif" }}>{s.value}</span>
                                <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500" }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}