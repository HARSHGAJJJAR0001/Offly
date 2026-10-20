import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import { Building2, Plus, Trash2, Search, X, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import { SkeletonTable, SkeletonHeader } from "../../components/Skeleton";

const glass = {
    background: "var(--bg-glass)", border: "1px solid var(--border-color)",
    borderRadius: "16px", backdropFilter: "blur(12px)",
};

export default function Departments() {
    const { isDark } = useTheme();
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState("");
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

    const fetchDepts = async () => {
        try {
            const res = await API.get("/departments");
            setDepartments(res.data?.data || res.data || []);
        } catch { notify("Failed to load departments.", "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDepts(); }, []);

    const notify = (text, type = "success") => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: "", type: "" }), 3500);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setCreating(true);
        try {
            await API.post("/departments", { name });
            setName(""); setShowForm(false);
            notify("Department created!");
            fetchDepts();
        } catch (err) {
            notify(err.response?.data?.message || "Failed to create.", "error");
        } finally { setCreating(false); }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/departments/${confirm.id}`);
            notify("Department deleted.");
            fetchDepts();
        } catch { notify("Failed to delete.", "error"); }
        finally { setConfirm({ open: false, id: null, name: "" }); }
    };

    const filtered = departments.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));

    const inp = {
        background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", padding: "11px 14px", color: "var(--text-secondary)", fontSize: "14px",
        fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s",
    };

    return (
        <AdminLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}.dept-row:hover{background:rgba(255,255,255,0.05)!important}input:focus{border-color:rgba(6,182,212,0.4)!important;box-shadow:0 0 0 3px rgba(6,182,212,0.08)!important}`}</style>

            <ConfirmModal
                open={confirm.open}
                title="Delete Department"
                message={`Delete "${confirm.name}"? This cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirm({ open: false, id: null, name: "" })}
            />

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.05))", border: "1px solid rgba(6,182,212,0.12)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(6,182,212,0.2),rgba(99,102,241,0.15))", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Building2 size={20} color="#67e8f9" />
                            </div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#67e8f9" : "#0d9488" }}>Departments</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>Manage and organize your company's departments</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px" }}>
                            <Search size={15} color="rgba(100,116,139,0.6)" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments…" style={{ background: "none", border: "none", outline: "none", color: "var(--text-secondary)", fontSize: "13px", width: "180px", fontFamily: "'DM Sans',sans-serif" }} />
                            {search && <X size={13} style={{ cursor: "pointer", color: "var(--text-faint)" }} onClick={() => setSearch("")} />}
                        </div>
                        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "10px", padding: "10px 18px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(20,184,166,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
                            <Plus size={16} /> New Department
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

                {/* Create form */}
                {showForm && (
                    <div style={{ ...glass, padding: "24px", border: "1px solid rgba(20,184,166,0.2)", background: "rgba(20,184,166,0.04)" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>Create New Department</h3>
                        <form onSubmit={handleCreate} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <input style={{ ...inp, flex: "1", minWidth: "220px" }} placeholder="e.g. Engineering, Marketing…" value={name} onChange={e => setName(e.target.value)} />
                            <button type="submit" disabled={creating || !name.trim()} style={{ display: "flex", alignItems: "center", gap: "8px", background: creating ? "rgba(20,184,166,0.2)" : "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "10px", padding: "11px 22px", color: creating ? "rgba(255,255,255,0.5)" : "#fff", fontSize: "13.5px", fontWeight: "700", cursor: creating ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                                {creating ? "Creating…" : <><Plus size={15} />Create</>}
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); setName(""); }} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "11px 16px", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>Cancel</button>
                        </form>
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {[
                        { label: "Total", value: departments.length, color: "#67e8f9" },
                        { label: "Showing", value: filtered.length, color: "#c4b5fd" },
                        { label: "With Managers", value: departments.filter(d => d.managerId).length, color: "#6ee7b7" },
                    ].map(s => (
                        <div key={s.label} style={{ ...glass, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "22px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif" }}>{s.value}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500" }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div style={{ ...glass, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr auto", padding: "14px 20px", borderBottom: "1px solid var(--divider)", background: "rgba(255,255,255,0.02)" }}>
                        {["#", "Department Name", "Manager", ""].map((h, i) => (
                            <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-faint)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</span>
                        ))}
                    </div>
                    {loading ? (
                        <SkeletonTable rows={5} cols={3} />
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-faint)", fontSize: "14px" }}>
                            {search ? `No departments match "${search}"` : "No departments yet. Create your first one!"}
                        </div>
                    ) : filtered.map((dept, i) => (
                        <div key={dept._id} className="dept-row" style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr auto", padding: "16px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "rgba(100,116,139,0.45)" }}>{String(i + 1).padStart(2, "0")}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.12))", border: "1px solid rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Building2 size={15} color="#67e8f9" />
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>{dept.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-faint)" }}>ID: {dept._id?.slice(-6)}</div>
                                </div>
                            </div>
                            <div>
                                {dept.managerId ? (
                                    <span style={{ fontSize: "13px", color: "#c4b5fd", fontWeight: "500" }}>{dept.managerId.name}</span>
                                ) : (
                                    <span style={{ fontSize: "12px", color: "rgba(100,116,139,0.45)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "20px" }}>Unassigned</span>
                                )}
                            </div>
                            <button onClick={() => setConfirm({ open: true, id: dept._id, name: dept.name })} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "7px 12px", color: "rgba(248,113,113,0.7)", fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(248,113,113,0.7)"; }}
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}