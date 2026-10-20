import { useState, useEffect } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import API from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";
import {
    Users, Search, Mail, X, Plus, Trash2, Edit3,
    CheckCircle, AlertCircle, Eye, EyeOff, Save,
} from "lucide-react";
import { SkeletonEmployeeCard } from "../../components/Skeleton";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };
const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#14b8a6", "#a855f7"];
const getInitials = (n = "") => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const inp = {
    width: "100%", background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "11px 14px", color: "var(--text-secondary)", fontSize: "13.5px",
    fontFamily: "'DM Sans',sans-serif", outline: "none",
};

export default function DepartmentEmployees() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [showAdd, setShowAdd] = useState(false);
    const [adding, setAdding] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [tempPwd, setTempPwd] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
    const [editEmp, setEditEmp] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
    const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

    const fetchEmployees = async () => {
        try {
            const res = await API.get("/employees");
            setEmployees(res.data?.data || res.data || []);
        } catch { notify("Failed to load team.", "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchEmployees(); }, [user]);

    const notify = (text, type = "success") => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: "", type: "" }), 3500);
    };

    // ── ADD EMPLOYEE ────────────────────────────────────────────────────────────
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) return notify("Name and email are required.", "error");
        setAdding(true);
        try {
            const res = await API.post("/employees", form);
            setForm({ name: "", email: "", password: "", role: "employee" });
            setShowAdd(false);
            if (res.data.temporaryPassword) {
                setTempPwd({ name: res.data.employee.name, email: res.data.employee.email, pwd: res.data.temporaryPassword });
            }
            fetchEmployees();
        } catch (err) {
            notify(err.response?.data?.message || "Failed to add employee.", "error");
        } finally { setAdding(false); }
    };

    // ── DELETE EMPLOYEE ─────────────────────────────────────────────────────────
    const handleDelete = async () => {
        try {
            await API.delete(`/employees/${confirm.id}`);
            notify("Employee removed.");
            fetchEmployees();
        } catch (err) {
            notify(err.response?.data?.message || "Failed to remove.", "error");
        } finally { setConfirm({ open: false, id: null, name: "" }); }
    };

    // ── UPDATE EMPLOYEE ─────────────────────────────────────────────────────────
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.put(`/employees/${editEmp._id}`, editForm);
            notify("Employee updated!");
            setEditEmp(null);
            fetchEmployees();
        } catch (err) {
            notify(err.response?.data?.message || "Failed to update.", "error");
        } finally { setSaving(false); }
    };

    const openEdit = (emp) => {
        setEditEmp(emp);
        setEditForm({ name: emp.name || "", email: emp.email || "", phone: emp.phone || "" });
    };

    const filtered = employees.filter(e =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ManagerLayout>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box}
        .emp-card:hover{transform:translateY(-2px)!important;box-shadow:0 12px 40px rgba(0,0,0,0.3)!important}
        input:focus{border-color:rgba(139,92,246,0.45)!important;box-shadow:0 0 0 3px rgba(139,92,246,0.08)!important;outline:none!important}
        select:focus{border-color:rgba(139,92,246,0.45)!important;outline:none!important}
        select option{background:#0d1528;color:#e2e8f0}
      `}</style>

            {/* Temp password modal */}
            {tempPwd && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div style={{ background: "rgba(13,21,40,0.98)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "20px", padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
                        <CheckCircle size={40} color="#34d399" style={{ marginBottom: "16px" }} />
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", fontFamily: "'DM Serif Display',serif" }}>Employee Added!</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Share these credentials with <strong style={{ color: "var(--text-secondary)" }}>{tempPwd.name}</strong>. They'll be asked to change password on first login.</p>
                        <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "4px" }}>Email</div>
                            <div style={{ fontSize: "14px", color: "#6ee7b7", fontWeight: "600", marginBottom: "12px" }}>{tempPwd.email}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "4px" }}>Temporary Password</div>
                            <div style={{ fontSize: "14px", color: "#6ee7b7", fontWeight: "700", fontFamily: "monospace", letterSpacing: "2px" }}>{tempPwd.pwd}</div>
                        </div>
                        <button onClick={() => setTempPwd(null)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Got it!</button>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editEmp && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setEditEmp(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "rgba(13,21,40,0.98)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "20px", padding: "32px", maxWidth: "420px", width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px", fontFamily: "'DM Serif Display',serif" }}>Edit Employee</h3>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {[
                                { label: "FULL NAME", key: "name", type: "text", placeholder: "John Doe" },
                                { label: "EMAIL", key: "email", type: "email", placeholder: "john@company.com" },
                                { label: "PHONE", key: "phone", type: "text", placeholder: "+91 9999999999" },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-faint)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>{f.label}</label>
                                    <input style={inp} type={f.type} placeholder={f.placeholder} value={editForm[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                                </div>
                            ))}
                            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                                <button type="submit" disabled={saving} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: "10px", padding: "12px", color: "#fff", fontSize: "13.5px", fontWeight: "700", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif" }}>
                                    <Save size={15} />{saving ? "Saving…" : "Save Changes"}
                                </button>
                                <button type="button" onClick={() => setEditEmp(null)} style={{ padding: "12px 18px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal open={confirm.open} title="Remove Employee" message={`Remove "${confirm.name}" from your department?`} onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null, name: "" })} />

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.05))", border: "1px solid rgba(139,92,246,0.15)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.15))", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Users size={20} color="#a5b4fc" />
                            </div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#c4b5fd" : "#6d28d9" }}>My Team</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>{employees.length} members · {user?.departmentId?.name || "Your Department"}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px" }}>
                            <Search size={15} color="rgba(100,116,139,0.6)" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team…" style={{ background: "none", border: "none", outline: "none", color: "var(--text-secondary)", fontSize: "13px", width: "160px", fontFamily: "'DM Sans',sans-serif" }} />
                            {search && <X size={13} style={{ cursor: "pointer", color: "var(--text-faint)" }} onClick={() => setSearch("")} />}
                        </div>
                        <button onClick={() => setShowAdd(!showAdd)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: "10px", padding: "10px 18px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(139,92,246,0.35)", fontFamily: "'DM Sans',sans-serif" }}>
                            <Plus size={16} /> Add Employee
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

                {/* Add form */}
                {showAdd && (
                    <div style={{ ...glass, padding: "24px", border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Add New Employee</h3>
                            <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", marginBottom: "16px" }}>
                                {[
                                    { label: "FULL NAME *", key: "name", type: "text", placeholder: "John Doe" },
                                    { label: "EMAIL *", key: "email", type: "email", placeholder: "john@company.com" },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>{f.label}</label>
                                        <input style={inp} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.label.includes("*")} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>PASSWORD</label>
                                    <div style={{ position: "relative" }}>
                                        <input style={{ ...inp, paddingRight: "40px" }} type={showPwd ? "text" : "password"} placeholder="Leave blank to auto-generate" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}>
                                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>ROLE</label>
                                    <select style={{ ...inp, cursor: "pointer" }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="employee">Employee</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" disabled={adding} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", border: "none", borderRadius: "10px", padding: "11px 22px", color: "#fff", fontSize: "13.5px", fontWeight: "700", cursor: adding ? "default" : "pointer", opacity: adding ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif" }}>
                                    {adding ? "Adding…" : <><Plus size={15} />Add Employee</>}
                                </button>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "11px 18px", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Employee cards */}
                {loading ? (
                    <div className="cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>{[1, 2, 3, 4, 5, 6].map(i => <SkeletonEmployeeCard key={i} />)}</div>
                ) : filtered.length === 0 ? (
                    <div style={{ ...glass, padding: "60px", textAlign: "center" }}>
                        <Users size={40} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} />
                        <div style={{ color: "var(--text-faint)", fontSize: "14px", marginBottom: "16px" }}>
                            {search ? `No team members match "${search}"` : "No team members yet. Add your first employee!"}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>
                        {filtered.map((emp, i) => {
                            const color = COLORS[i % COLORS.length];
                            return (
                                <div key={emp._id} className="emp-card" style={{ ...glass, padding: "22px", transition: "all 0.25s ease", position: "relative" }}>
                                    {/* Avatar */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                                        <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: `linear-gradient(135deg,${color}40,${color}20)`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color, flexShrink: 0, fontFamily: "'DM Serif Display',serif" }}>
                                            {getInitials(emp.name)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "3px" }}>{emp.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-faint)", textTransform: "capitalize" }}>{emp.role}</div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    {emp.email && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "16px" }}>
                                            <Mail size={13} color="rgba(100,116,139,0.5)" />
                                            <span style={{ fontSize: "12.5px", color: "rgba(148,163,184,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.email}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => openEdit(emp)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: "8px", padding: "8px", color: "#a5b4fc", fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.15)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.08)"}
                                        >
                                            <Edit3 size={13} /> Edit
                                        </button>
                                        <button onClick={() => setConfirm({ open: true, id: emp._id, name: emp.name })} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "8px", color: "rgba(248,113,113,0.7)", fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "rgba(248,113,113,0.7)"; }}
                                        >
                                            <Trash2 size={13} /> Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {[
                        { label: "Total", value: employees.length, color: "#c4b5fd" },
                        { label: "Employees", value: employees.filter(e => e.role === "employee").length, color: "#67e8f9" },
                        { label: "Managers", value: employees.filter(e => e.role === "manager").length, color: "#fbbf24" },
                    ].map(s => (
                        <div key={s.label} style={{ ...glass, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", flex: "1", minWidth: "110px" }}>
                            <span style={{ fontSize: "22px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif" }}>{s.value}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: "500" }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ManagerLayout>
    );
}