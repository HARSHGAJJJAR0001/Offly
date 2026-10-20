import { exportLogsToExcel, exportLogsToPDF } from "../../utils/exportUtils";
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/axios";
import { Activity, Search, Clock, X, Filter } from "lucide-react";
import ExportMenu from "../../components/ExportMenu";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };

const ACTION_COLORS = {
    "Created": "#34d399",
    "Deleted": "#f87171",
    "Added": "#67e8f9",
    "Approved": "#34d399",
    "Rejected": "#f87171",
    "Updated": "#fbbf24",
};

function getActionColor(action = "") {
    for (const [key, color] of Object.entries(ACTION_COLORS)) {
        if (action.startsWith(key)) return color;
    }
    return "#a5b4fc";
}

export default function ActivityLogs() {
    const { isDark } = useTheme();
    const [logs, setLogs] = useState([]);
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type) => {
        setExporting(true);
        try {
            const res = await API.get("/admin/activity-logs");
            const all = res.data?.data || res.data || [];
            if (type === "excel") exportLogsToExcel(all);
            else exportLogsToPDF(all);
        } catch (e) { console.error("Export error:", e); alert("Export failed."); }
        finally { setExporting(false); }
    };
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        API.get("/admin/activity-logs")
            .then(res => setLogs(res.data?.data || res.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = logs.filter(l => {
        const q = search.toLowerCase();
        return (
            l.action?.toLowerCase().includes(q) ||
            l.performedBy?.name?.toLowerCase().includes(q)
        );
    });

    const fmt = (d) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    return (
        <AdminLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}.log-row:hover{background:rgba(255,255,255,0.04)!important}input:focus{outline:none;border-color:rgba(99,102,241,0.4)!important}`}</style>
            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.15)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Activity size={20} color="#a5b4fc" />
                            </div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#a5b4fc" : "#4338ca" }}>Activity Logs</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>Track all actions performed in the system</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ExportMenu
                            onExportExcel={() => handleExport("excel")}
                            onExportPDF={() => handleExport("pdf")}
                            label={exporting ? "Exporting…" : "Export"}
                            disabled={logs.length === 0 || exporting}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px", minWidth: "240px" }}>
                            <Search size={15} color="rgba(100,116,139,0.6)" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" style={{ background: "none", border: "none", outline: "none", color: "var(--text-secondary)", fontSize: "13px", width: "100%", fontFamily: "'DM Sans',sans-serif" }} />
                            {search && <X size={13} style={{ cursor: "pointer", color: "var(--text-faint)" }} onClick={() => setSearch("")} />}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ ...glass, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: "#a5b4fc", fontFamily: "'DM Serif Display',serif" }}>{logs.length}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500" }}>Total Actions</span>
                    </div>
                    <div style={{ ...glass, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: "#67e8f9", fontFamily: "'DM Serif Display',serif" }}>{filtered.length}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500" }}>Showing</span>
                    </div>
                </div>

                {/* Logs table */}
                {loading ? (
                    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-faint)" }}>Loading activity logs…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ ...glass, padding: "60px", textAlign: "center" }}>
                        <Activity size={40} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} />
                        <div style={{ color: "var(--text-faint)", fontSize: "14px" }}>No activity logs found.</div>
                    </div>
                ) : (
                    <div style={{ ...glass, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 160px 180px", padding: "13px 20px", borderBottom: "1px solid var(--divider)", background: "rgba(255,255,255,0.02)" }}>
                            {["#", "Action", "Performed By", "Time"].map((h, i) => (
                                <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.55)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</span>
                            ))}
                        </div>
                        {filtered.map((log, i) => {
                            const color = getActionColor(log.action);
                            return (
                                <div key={log._id || i} className="log-row" style={{ display: "grid", gridTemplateColumns: "44px 1fr 160px 180px", padding: "14px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.035)", transition: "background 0.15s" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(100,116,139,0.4)" }}>{String(i + 1).padStart(2, "0")}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}60`, flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)" }}>{log.action}</div>
                                            {log.details && <div style={{ fontSize: "11.5px", color: "rgba(100,116,139,0.55)" }}>{log.details}</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-muted)" }}>{log.performedBy?.name || "System"}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "capitalize" }}>{log.performedBy?.role || ""}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <Clock size={12} color="rgba(100,116,139,0.45)" />
                                        <span style={{ fontSize: "12px", color: "rgba(100,116,139,0.55)" }}>{fmt(log.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}