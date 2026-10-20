import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useTheme } from "../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import API from "../../api/axios";
import { SkeletonCard, SkeletonHeader } from "../../components/Skeleton";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend,
} from "recharts";
import { Building2, Users, Calendar, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

const DEPT_COLORS = ["#14b8a6", "#8b5cf6", "#f59e0b", "#06b6d4", "#f43f5e", "#10b981", "#6366f1", "#a855f7"];

export default function DepartmentAnalytics() {
    const { isDark } = useTheme();
    const [selected, setSelected] = useState(null);

    const { data: analytics = [], isLoading } = useQuery({
        queryKey: ["admin", "department-analytics"],
        queryFn: () => API.get("/admin/department-analytics").then(r => r.data),
        staleTime: 1000 * 60 * 2,
    });

    const txt = "var(--text-secondary)";
    const muted = "var(--text-faint)";
    const cardBg = "var(--bg - glass)";
    const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
    const gridClr = "var(--chart-grid)";

    const card = {
        background: "var(--bg-glass)", border: "1px solid var(--border-color)",
        borderRadius: "16px", backdropFilter: "blur(12px)",
        boxShadow: "var(--shadow-card)",
    };

    // Summary bar chart data
    const summaryData = analytics.map((d, i) => ({
        name: d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name,
        fullName: d.name,
        employees: d.totalEmployees,
        leaves: d.leaves.total,
        color: DEPT_COLORS[i % DEPT_COLORS.length],
    }));

    // Selected dept detail
    const dept = selected !== null ? analytics[selected] : null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: "var(--tooltip-bg)", border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: "12px", color: muted, marginBottom: "6px" }}>{payload[0]?.payload?.fullName || label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: p.color || p.fill }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: p.color || p.fill }} />
                        {p.name}: {p.value}
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) return (
        <AdminLayout>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <SkeletonHeader />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        </AdminLayout>
    );

    const totals = {
        departments: analytics.length,
        employees: analytics.reduce((a, d) => a + d.totalEmployees, 0),
        leaves: analytics.reduce((a, d) => a + d.leaves.total, 0),
        pending: analytics.reduce((a, d) => a + d.leaves.pending, 0),
    };

    return (
        <AdminLayout>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box}
        .dept-card:hover{transform:translateY(-2px)!important;box-shadow:0 12px 40px rgba(0,0,0,0.25)!important}
        .dept-card.selected{border-color:var(--accent-teal)!important}
      `}</style>

            <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Header */}
                <div style={{ ...card, padding: "28px 32px", background: isDark ? "linear-gradient(135deg,rgba(20,184,166,0.08),rgba(6,182,212,0.05))" : "linear-gradient(135deg,rgba(20,184,166,0.05),rgba(6,182,212,0.03))", border: `1px solid ${isDark ? "rgba(20,184,166,0.15)" : "rgba(20,184,166,0.2)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,rgba(20,184,166,0.2),rgba(6,182,212,0.15))", border: "1px solid rgba(20,184,166,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrendingUp size={20} color="#5eead4" />
                        </div>
                        <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: "800", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", margin: 0, color: isDark ? "#5eead4" : "#0d9488" }}>Department Analytics</h1>
                    </div>
                    <p style={{ color: muted, fontSize: "14px", margin: 0 }}>Performance overview across all departments</p>
                </div>

                {/* Summary KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px" }}>
                    {[
                        { label: "Departments", value: totals.departments, icon: Building2, color: "#14b8a6", bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.2)" },
                        { label: "Total Staff", value: totals.employees, icon: Users, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
                        { label: "All Leaves", value: totals.leaves, icon: Calendar, color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.2)" },
                        { label: "Pending", value: totals.pending, icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
                    ].map(({ label, value, icon: Icon, color, bg, border: b }) => (
                        <div key={label} style={{ ...card, padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, border: `1px solid ${b}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon size={20} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: "28px", fontWeight: "800", color, fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{value}</div>
                                <div style={{ fontSize: "12px", color: muted, marginTop: "4px" }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main charts row */}
                <div className="charts-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                    {/* Employees per dept bar chart */}
                    <div style={{ ...card, padding: "24px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: txt, marginBottom: "4px" }}>Employees per Department</div>
                        <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>Total headcount comparison</div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={summaryData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={24}>
                                <CartesianGrid vertical={false} stroke={gridClr} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans,sans-serif" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 10 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="employees" name="Employees" radius={[6, 6, 0, 0]}>
                                    {summaryData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Leaves per dept bar chart */}
                    <div style={{ ...card, padding: "24px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: txt, marginBottom: "4px" }}>Leave Requests per Department</div>
                        <div style={{ fontSize: "12px", color: muted, marginBottom: "20px" }}>Total leaves submitted</div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={summaryData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={24}>
                                <CartesianGrid vertical={false} stroke={gridClr} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 11, fontFamily: "DM Sans,sans-serif" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 10 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="leaves" name="Leaves" radius={[6, 6, 0, 0]}>
                                    {summaryData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.8} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department cards — click to see detail */}
                <div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: txt, marginBottom: "14px" }}>
                        Select a Department for Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "14px" }}>
                        {analytics.map((d, i) => {
                            const color = DEPT_COLORS[i % DEPT_COLORS.length];
                            const isActive = selected === i;
                            return (
                                <div
                                    key={d.id}
                                    className={`dept-card${isActive ? " selected" : ""}`}
                                    onClick={() => setSelected(isActive ? null : i)}
                                    style={{
                                        ...card, padding: "20px", cursor: "pointer", transition: "all 0.2s",
                                        border: `1px solid ${isActive ? color : border}`,
                                        boxShadow: isActive ? `0 0 0 2px ${color}30, 0 8px 24px rgba(0,0,0,0.2)` : undefined,
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}20`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Building2 size={18} color={color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "15px", fontWeight: "700", color: txt }}>{d.name}</div>
                                            <div style={{ fontSize: "12px", color: muted }}>{d.manager}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                                        {[
                                            { label: "Staff", value: d.totalEmployees, color: "#67e8f9" },
                                            { label: "Leaves", value: d.leaves.total, color: color },
                                            { label: "Pending", value: d.leaves.pending, color: "#fbbf24" },
                                        ].map(s => (
                                            <div key={s.label} style={{ background: "var(--bg-input)", borderRadius: "8px", padding: "10px 8px", textAlign: "center" }}>
                                                <div style={{ fontSize: "20px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{s.value}</div>
                                                <div style={{ fontSize: "10px", color: muted, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected department detail */}
                {dept && (
                    <div style={{ ...card, padding: "28px", border: `1px solid ${DEPT_COLORS[selected % DEPT_COLORS.length]}30`, animation: "fadeUp 0.3s ease" }}>
                        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
                            <div>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", fontFamily: "'DM Serif Display',serif", color: txt, margin: 0, marginBottom: "4px" }}>{dept.name}</h2>
                                <p style={{ color: muted, fontSize: "13px", margin: 0 }}>Manager: {dept.manager}</p>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {[
                                    { label: "Approved", value: dept.leaves.approved, color: "#34d399" },
                                    { label: "Pending", value: dept.leaves.pending, color: "#fbbf24" },
                                    { label: "Rejected", value: dept.leaves.rejected, color: "#f87171" },
                                ].map(s => (
                                    <div key={s.label} style={{ textAlign: "center", background: `${s.color}12`, border: `1px solid ${s.color}25`, borderRadius: "10px", padding: "10px 16px" }}>
                                        <div style={{ fontSize: "22px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif" }}>{s.value}</div>
                                        <div style={{ fontSize: "11px", color: muted }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 6 month trend line chart */}
                        <div style={{ fontSize: "14px", fontWeight: "700", color: txt, marginBottom: "16px" }}>
                            6-Month Leave Trend
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={dept.monthlyTrend} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                                <CartesianGrid stroke={gridClr} strokeDasharray="3 3" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: muted, fontSize: 10 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone" dataKey="leaves" name="Leaves"
                                    stroke={DEPT_COLORS[selected % DEPT_COLORS.length]}
                                    strokeWidth={2.5} dot={{ r: 4, fill: DEPT_COLORS[selected % DEPT_COLORS.length] }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Leave breakdown pie */}
                        <div style={{ marginTop: "24px" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: txt, marginBottom: "16px" }}>Leave Status Breakdown</div>
                            {dept.leaves.total === 0 ? (
                                <div style={{ textAlign: "center", padding: "24px", color: muted, fontSize: "14px" }}>
                                    No leave requests for this department yet.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Approved", value: dept.leaves.approved, fill: "#34d399" },
                                                { name: "Pending", value: dept.leaves.pending, fill: "#fbbf24" },
                                                { name: "Rejected", value: dept.leaves.rejected, fill: "#f87171" },
                                            ].filter(d => d.value > 0)}
                                            cx="50%" cy="50%"
                                            innerRadius={40} outerRadius={65}
                                            paddingAngle={3} dataKey="value"
                                        >
                                            {[{ fill: "#34d399" }, { fill: "#fbbf24" }, { fill: "#f87171" }].map((e, i) => (
                                                <Cell key={i} fill={e.fill} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" iconSize={8}
                                            formatter={(v) => <span style={{ color: muted, fontSize: "12px" }}>{v}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}