import { exportEmployeesToExcel, exportEmployeesToPDF } from "../../utils/exportUtils";
import { useState, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import Pagination from "../../components/Pagination";
import { Users, Search, Plus, Trash2, Mail, X, AlertCircle, CheckCircle, Filter, Eye, EyeOff } from "lucide-react";
import { SkeletonTable } from "../../components/Skeleton";
import { debounce } from "../../utils/debounce";
import ExportMenu from "../../components/ExportMenu";
import { useTheme } from "../../context/ThemeContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KEYS } from "../../hooks/queryKeys";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };
const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#14b8a6", "#a855f7"];
const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function Employees() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [page, setPage] = useState(1);
    const { isDark } = useTheme();
    const qc = useQueryClient();
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type) => {
        setExporting(true);
        try {
            const res = await API.get("/employees?limit=10000");
            const all = res.data?.data || res.data || [];
            if (type === "excel") exportEmployeesToExcel(all);
            else exportEmployeesToPDF(all);
        } catch (e) { console.error("Export error:", e); alert("Export failed."); }
        finally { setExporting(false); }
    };

    const empParams = new URLSearchParams({ page, limit: 10 });
    if (search) empParams.append("search", search);
    if (deptFilter !== "all") empParams.append("department", deptFilter);

    const { data: empData, isLoading: loading } = useQuery({
        queryKey: KEYS.employees({ page, search, department: deptFilter }),
        queryFn: () => API.get(`/employees?${empParams}`).then(r => r.data),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });

    const employees = empData?.data || [];
    const pagination = empData?.pagination || null;
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
    const [tempPwd, setTempPwd] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", departmentId: "", role: "employee" });

    // Fetch departments separately (rarely changes)
    useQuery({
        queryKey: KEYS.departments(),
        queryFn: () => API.get("/departments").then(r => { setDepartments(r.data); return r.data; }),
        staleTime: 1000 * 60 * 5,
    });

    const debouncedSearch = useCallback(debounce((val) => { setPage(1); }, 400), []);
    const handleSearchChange = (val) => { setSearch(val); debouncedSearch(val); };

    const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 4000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) return;
        setCreating(true);
        try {
            const res = await API.post("/employees", form);
            setForm({ name: "", email: "", password: "", departmentId: "", role: "employee" });
            setShowForm(false);
            if (res.data.temporaryPassword) setTempPwd({ name: res.data.employee.name, email: res.data.employee.email, pwd: res.data.temporaryPassword });
            setPage(1);
            qc.invalidateQueries({ queryKey: ["employees"] });
        } catch (err) { notify(err.response?.data?.message || "Failed to add.", "error"); }
        finally { setCreating(false); }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/employees/${confirm.id}`);
            notify("Employee removed.");
            qc.invalidateQueries({ queryKey: ["employees"] });
        } catch { notify("Failed to remove.", "error"); }
        finally { setConfirm({ open: false, id: null, name: "" }); }
    };

    const inp = { width: "100%", background: "var(--bg-input)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 14px", color: "var(--text-secondary)", fontSize: "13.5px", fontFamily: "'DM Sans',sans-serif", outline: "none" };

    return (
        <AdminLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');*{box-sizing:border-box}.emp-row:hover{background:rgba(255,255,255,0.04)!important}input:focus,select:focus{border-color:rgba(99,102,241,0.4)!important;outline:none!important}select option{background:#0d1528;color:#e2e8f0}`}</style>

            <ConfirmModal open={confirm.open} title="Remove Employee" message={`Remove "${confirm.name}" from the system?`} onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null, name: "" })} />

            {/* Temp password modal */}
            {tempPwd && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div style={{ background: "rgba(13,21,40,0.98)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "20px", padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
                        <CheckCircle size={40} color="#34d399" style={{ marginBottom: "16px" }} />
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", fontFamily: "'DM Serif Display',serif" }}>Employee Added!</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Share credentials with <strong style={{ color: "var(--text-secondary)" }}>{tempPwd.name}</strong>.</p>
                        <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "4px" }}>Email</div>
                            <div style={{ fontSize: "14px", color: "#6ee7b7", fontWeight: "600", marginBottom: "12px" }}>{tempPwd.email}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "4px" }}>Temp Password</div>
                            <div style={{ fontSize: "14px", color: "#6ee7b7", fontWeight: "700", fontFamily: "monospace", letterSpacing: "2px" }}>{tempPwd.pwd}</div>
                        </div>
                        <button onClick={() => setTempPwd(null)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Got it!</button>
                    </div>
                </div>
            )}

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...glass, padding: "28px 32px", background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.15)", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Users size={20} color="#a5b4fc" />
                            </div>
                            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#c4b5fd" : "#4f46e5" }}>Employees</h1>
                        </div>
                        <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>
                            {pagination ? `${pagination.total} total members` : "Loading..."}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <ExportMenu
                            onExportExcel={() => handleExport("excel")}
                            onExportPDF={() => handleExport("pdf")}
                            label={exporting ? "Exporting…" : "Export"}
                            disabled={employees.length === 0 || exporting}
                        />
                        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", padding: "10px 18px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", fontFamily: "'DM Sans',sans-serif" }}>
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
                {showForm && (
                    <div style={{ ...glass, padding: "24px", border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Add New Employee</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", marginBottom: "16px" }}>
                                {[{ label: "FULL NAME *", key: "name", type: "text", placeholder: "John Doe" }, { label: "EMAIL *", key: "email", type: "email", placeholder: "john@company.com" }].map(f => (
                                    <div key={f.key}>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>{f.label}</label>
                                        <input style={inp} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>PASSWORD</label>
                                    <div style={{ position: "relative" }}>
                                        <input style={{ ...inp, paddingRight: "40px" }} type={showPwd ? "text" : "password"} placeholder="Leave blank to auto-generate" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>DEPARTMENT</label>
                                    <select style={{ ...inp, cursor: "pointer" }} value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
                                        <option value="">Select department</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.65)", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>ROLE</label>
                                    <select style={{ ...inp, cursor: "pointer" }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" disabled={creating} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", padding: "11px 22px", color: "#fff", fontSize: "13.5px", fontWeight: "700", cursor: creating ? "default" : "pointer", opacity: creating ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif" }}>
                                    {creating ? "Adding…" : <><Plus size={15} />Add Employee</>}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "11px 18px", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters */}
                <div className="filters-bar" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1", minWidth: "200px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px" }}>
                        <Search size={15} color="rgba(100,116,139,0.6)" />
                        <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search by name or email…" style={{ background: "none", border: "none", outline: "none", color: "var(--text-secondary)", fontSize: "13px", width: "100%", fontFamily: "'DM Sans',sans-serif" }} />
                        {search && <X size={13} style={{ cursor: "pointer", color: "var(--text-faint)" }} onClick={() => { setSearch(""); setPage(1); fetchData("", 1); }} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Filter size={14} color="rgba(100,116,139,0.5)" />
                        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "9px 14px", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                            <option value="all">All Departments</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <SkeletonTable rows={8} cols={5} />
                ) : employees.length === 0 ? (
                    <div style={{ ...glass, padding: "60px", textAlign: "center" }}>
                        <Users size={40} color="rgba(100,116,139,0.3)" style={{ marginBottom: "12px" }} />
                        <div style={{ color: "var(--text-faint)", fontSize: "14px" }}>No employees found.</div>
                    </div>
                ) : (
                    <>
                        <div className="table-scroll" style={{ ...glass, overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 1fr auto", padding: "13px 20px", borderBottom: "1px solid var(--divider)", background: "rgba(255,255,255,0.02)" }}>
                                {["#", "Employee", "Email", "Department", ""].map((h, i) => (
                                    <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.55)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</span>
                                ))}
                            </div>
                            {employees.map((emp, i) => {
                                const color = COLORS[i % COLORS.length];
                                const rowNum = (pagination.page - 1) * pagination.limit + i + 1;
                                return (
                                    <div key={emp._id} className="emp-row" style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 1fr auto", padding: "14px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.035)", transition: "background 0.15s" }}>
                                        <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(100,116,139,0.4)" }}>{String(rowNum).padStart(2, "0")}</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: `linear-gradient(135deg,${color}35,${color}18)`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color, flexShrink: 0 }}>{getInitials(emp.name)}</div>
                                            <div>
                                                <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)" }}>{emp.name}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "capitalize" }}>{emp.role}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Mail size={13} color="rgba(100,116,139,0.4)" />
                                            <span style={{ fontSize: "13px", color: "rgba(148,163,184,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.email || "—"}</span>
                                        </div>
                                        <div>
                                            {emp.departmentId?.name
                                                ? <span style={{ fontSize: "12px", fontWeight: "600", color: "#67e8f9", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)", padding: "4px 10px", borderRadius: "20px" }}>{emp.departmentId.name}</span>
                                                : <span style={{ fontSize: "12px", color: "rgba(100,116,139,0.4)" }}>—</span>
                                            }
                                        </div>
                                        <button onClick={() => setConfirm({ open: true, id: emp._id, name: emp.name })} style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.13)", borderRadius: "8px", padding: "6px 11px", color: "rgba(248,113,113,0.6)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "rgba(248,113,113,0.6)"; }}
                                        >
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <Pagination pagination={pagination} onPageChange={(pg) => setPage(pg)} />
                    </>
                )}
            </div>
        </AdminLayout>
    );
}