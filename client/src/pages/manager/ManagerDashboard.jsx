import { useState, useEffect } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import DashboardCard from "../../components/DashboardCard";
import API from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Users, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import { SkeletonCard, SkeletonHeader } from "../../components/Skeleton";
import { useNavigate } from "react-router-dom";

const glass = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "16px", backdropFilter: "blur(12px)" };

export default function ManagerDashboard() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const deptId = user?.departmentId?._id || user?.departmentId;
                const [empRes, leaveRes] = await Promise.all([
                    API.get(`/departments/employees/${deptId}`),
                    API.get("/leaves"),
                ]);
                setEmployees(empRes.data?.data || empRes.data || []);
                setLeaves(leaveRes.data?.data || leaveRes.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        if (user) fetchAll();
    }, [user]);

    const leavesList = Array.isArray(leaves) ? leaves : [];
    const pending = leavesList.filter(l => l.status === "pending").length;
    const approved = leavesList.filter(l => l.status === "approved").length;

    return (
        <ManagerLayout>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');`}</style>
            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ ...glass, padding: "28px 32px", background: "var(--bg-glass)", border: "1px solid var(--border-color)" }}>
                    <h1 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", marginBottom: "8px", color: isDark ? "#f0fdf4" : "#0f172a" }}>
                        Welcome, <span style={{ color: isDark ? "#c4b5fd" : "#6d28d9" }}>{user?.name?.split(" ")[0]}</span> 👋
                    </h1>
                    <p style={{ color: "var(--text-faint)", fontSize: "14px", margin: 0 }}>
                        Managing: <strong style={{ color: "#c4b5fd" }}>{user?.departmentId?.name || "Your Department"}</strong>
                    </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
                    <DashboardCard title="Team Members" value={employees.length} icon="users" color="purple" subtitle="in your dept" />
                    <DashboardCard title="Pending Leaves" value={pending} icon="calendar" color="orange" subtitle="need review" />
                    <DashboardCard title="Approved Leaves" value={approved} icon="checkcircle" color="green" subtitle="this month" />
                    <DashboardCard title="Total Requests" value={leavesList.length} icon="trending" color="blue" subtitle="all time" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {[
                        { label: "View My Team", icon: Users, color: "#8b5cf6", href: "/manager/employees" },
                        { label: "Leave Requests", icon: Calendar, color: "#f59e0b", href: "/manager/leaves", badge: pending },
                    ].map(({ label, icon: Icon, color, href, badge }) => (
                        <button key={label} onClick={() => navigate(href)} style={{ ...glass, padding: "24px", cursor: "pointer", border: `1px solid ${color}25`, background: `${color}08`, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.boxShadow = `0 8px 30px ${color}20`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={20} color={color} /></div>
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-secondary)" }}>{label}</div>
                                    {badge > 0 && <div style={{ fontSize: "12px", color: "#fbbf24" }}>{badge} pending</div>}
                                </div>
                            </div>
                            <ArrowRight size={18} color={color} />
                        </button>
                    ))}
                </div>
            </div>
        </ManagerLayout>
    );
}