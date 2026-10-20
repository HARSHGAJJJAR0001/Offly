import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { SkeletonDashboard } from "../../components/Skeleton";
import DashboardCard from "../../components/DashboardCard";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useAdminStats, useWeeklyLeaves, useActivityLogs } from "../../hooks/useAdminQueries";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import {
  Users, Building2, Calendar, Activity, Clock, CheckCircle,
  TrendingUp, AlertCircle, FileText, UserPlus, ArrowRight, Zap,
  XCircle,
} from "lucide-react";

const glass = {
  background: "var(--bg-glass)", border: "1px solid var(--border-color)",
  borderRadius: "20px", backdropFilter: "blur(12px)",
};

const STATUS_COLORS = {
  success: { bg: "rgba(16,185,129,0.1)", text: "#34d399", border: "rgba(16,185,129,0.2)" },
  pending: { bg: "rgba(6,182,212,0.1)", text: "#67e8f9", border: "rgba(6,182,212,0.2)" },
  info: { bg: "rgba(139,92,246,0.1)", text: "#c4b5fd", border: "rgba(139,92,246,0.2)" },
  warning: { bg: "rgba(245,158,11,0.1)", text: "#fcd34d", border: "rgba(245,158,11,0.2)" },
  error: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.2)" },
};

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{
          fontSize: "12px", fontWeight: "600", color: "var(--accent-teal)",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans',sans-serif", padding: "4px 8px", borderRadius: "6px",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#67e8f9"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(103,232,249,0.7)"}
        >{action} →</button>
      )}
    </div>
  );
}

// ── Custom Tooltip for Bar Chart ─────────────────────────────────────────────
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--tooltip-bg)", border: `1px solid ${"var(--border-color)"}`, borderRadius: "10px", padding: "10px 14px", boxShadow: "var(--shadow-card)" }}>
      <div style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--accent-teal)" }}>{payload[0].value} <span style={{ fontSize: "12px", fontWeight: "400", color: "var(--text-faint)" }}>requests</span></div>
    </div>
  );
}

// ── Recharts Bar Chart ────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  const TEAL = "#14b8a6";
  const PURPLE = "#8b5cf6";
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barSize={28}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="label"
          axisLine={false} tickLine={false}
          tick={({ x, y, payload }) => {
            const d = data.find(d => d.label === payload.value);
            return (
              <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={14} textAnchor="middle"
                  fill={d?.isToday ? TEAL : "rgba(100,116,139,0.55)"}
                  fontSize={11} fontWeight={d?.isToday ? "700" : "500"}
                  fontFamily="DM Sans, sans-serif"
                >{payload.value}</text>
                {d?.isToday && <circle cx={0} cy={22} r={2.5} fill={TEAL} />}
              </g>
            );
          }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--chart-axis)", fontSize: 10, fontFamily: "DM Sans,sans-serif" }} allowDecimals={false} />
        <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)", radius: 6 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i}
              fill={entry.isToday ? "#f0fdf4" : entry.value === 0 ? "var(--bg-glass-hover)" : TEAL}
              opacity={entry.isToday ? 1 : 0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Custom Tooltip for Pie Chart ─────────────────────────────────────────────
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--tooltip-bg)", border: `1px solid ${"var(--border-color)"}`, borderRadius: "10px", padding: "10px 14px", boxShadow: "var(--shadow-card)" }}>
      <div style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "4px" }}>{payload[0].name}</div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: payload[0].payload.fill }}>{payload[0].value}</div>
    </div>
  );
}

// ── Recharts Donut Chart ──────────────────────────────────────────────────────
function DonutChart({ segments }) {
  const data = segments.map(s => ({ name: s.name, value: s.value, fill: s.color }));
  const total = data.reduce((a, b) => a + b.value, 0);

  // Custom center label — guard against undefined viewBox on first render
  const CenterLabel = ({ viewBox }) => {
    if (!viewBox) return null;
    const { cx, cy } = viewBox;
    return (
      <g>
        <text x={cx} y={cy - 6} textAnchor="middle" fill={"var(--text-primary)"} fontSize="24" fontWeight="800" fontFamily="DM Serif Display, serif">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={"var(--text-faint)"} fontSize="11" fontFamily="DM Sans, sans-serif">total</text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={55} outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={<CenterLabel />}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          formatter={(value) => <span style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "DM Sans,sans-serif" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}


export default function AdminDashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState("month");

  const { data: statsData, isLoading: statsLoading } = useAdminStats(timeRange);
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyLeaves();
  const { data: logsData, isLoading: logsLoading } = useActivityLogs();

  const stats = statsData || {};
  const logs = logsData || [];
  const weekly = weeklyData || [];

  const loading = statsLoading || weeklyLoading || logsLoading;

  if (loading) return (
    <AdminLayout>
      <SkeletonDashboard />
    </AdminLayout>
  );

  const donutData = [
    { color: "#34d399", name: "Approved", value: stats.approvedLeaves || 0 },
    { color: "#fbbf24", name: "Pending", value: stats.pendingLeaves || 0 },
    { color: "#f87171", name: "Rejected", value: stats.rejectedLeaves || 0 },
  ];

  const barData = weekly.length > 0 ? weekly : [
    { label: "Mon", value: 0 }, { label: "Tue", value: 0 },
    { label: "Wed", value: 0 }, { label: "Thu", value: 0 },
    { label: "Fri", value: 0 }, { label: "Sat", value: 0 },
    { label: "Sun", value: 0 },
  ];

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        .qa-btn:hover{transform:translateY(-2px)!important}
        .log-row:hover{background:var(--bg-glass-hover)!important}
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ── Hero Banner ── */}
        <div style={{
          position: "relative", borderRadius: "24px",
          background: isDark ? "linear-gradient(135deg,#0d2137,#0a1e35,#0e1a3a)" : "linear-gradient(135deg,#e0f2fe,#ede9fe,#e0fdf4)",
          border: `1px solid ${isDark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.25)"}`, padding: "32px",
          boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: isDark ? "rgba(52,211,153,0.8)" : "#059669", letterSpacing: "1px", textTransform: "uppercase" }}>All Systems Operational</span>
              </div>
              <h1 style={{
                fontSize: "clamp(22px,4vw,34px)", fontWeight: "800",
                fontFamily: "'DM Serif Display',serif",
                letterSpacing: "-1px", margin: "0 0 8px 0",
                color: isDark ? "#f0fdf4" : "#0f172a",
              }}>
                Welcome back,{" "}
                <span style={{ color: isDark ? "#67e8f9" : "#0d9488" }}>
                  {user?.name?.split(" ")[0]}
                </span>{" "}👋
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "380px", lineHeight: 1.6 }}>
                Here's your live organization overview.
              </p>
            </div>
            <div style={{ display: "flex", gap: "4px", padding: "4px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`, borderRadius: "12px" }}>
              {["day", "week", "month", "year"].map(r => (
                <button key={r} onClick={() => setTimeRange(r)} style={{
                  padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: "600", fontFamily: "'DM Sans',sans-serif",
                  background: timeRange === r ? "rgba(6,182,212,0.15)" : "var(--bg-glass)",
                  color: timeRange === r ? (isDark ? "#67e8f9" : "#0d9488") : "var(--text-muted)",
                  boxShadow: timeRange === r ? "inset 0 0 0 1px rgba(6,182,212,0.25)" : "none",
                  transition: "all 0.2s",
                }}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* Quick stats strip */}
          <div style={{ position: "relative", marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[
              { label: "Total Staff", value: stats.totalEmployees || 0, color: "#67e8f9" },
              { label: "Departments", value: stats.totalDepartments || 0, color: "#c4b5fd" },
              { label: "Pending", value: stats.pendingLeaves || 0, color: "#fcd34d" },
            ].map(s => (
              <div key={s.label} style={{ padding: "10px 18px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`, borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: "800", color: s.color, fontFamily: "'DM Serif Display',serif" }}>{s.value}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div>
          <SectionHeader title="Key Metrics" />
          <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
            <DashboardCard title="Total Employees" value={stats.totalEmployees || 0} icon="users" color="blue" trend={stats.trends?.employees ?? null} trendLabel={stats.trendLabel} subtitle="active staff" />
            <DashboardCard title="Departments" value={stats.totalDepartments || 0} icon="building" color="green" trend={stats.trends?.departments ?? null} trendLabel={stats.trendLabel} subtitle="teams" />
            <DashboardCard title="Pending Leaves" value={stats.pendingLeaves || 0} icon="calendar" color="orange" trend={stats.trends?.pending ?? null} trendLabel={stats.trendLabel} subtitle="awaiting review" />
            <DashboardCard title="Approved Leaves" value={stats.approvedLeaves || 0} icon="checkcircle" color="purple" trend={stats.trends?.approved ?? null} trendLabel={stats.trendLabel} subtitle="this month" />
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="charts-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Bar chart */}
          <div style={{ ...glass, padding: "24px" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>Weekly Leave Requests</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Requests per day this week</div>
            <MiniBarChart data={barData} />
          </div>

          {/* Donut chart */}
          <div style={{ ...glass, padding: "24px" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>Leave Status Breakdown</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>All time distribution</div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <DonutChart segments={donutData} />

            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <SectionHeader title="Quick Actions" />
          <div className="quick-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
            {[
              { icon: UserPlus, label: "Add Employee", sub: "Onboard member", color: "#06b6d4", href: "/admin/employees" },
              { icon: Building2, label: "New Department", sub: "Create a team", color: "#10b981", href: "/admin/departments" },
              { icon: Calendar, label: "Manage Leaves", sub: "Review requests", color: "#8b5cf6", href: "/admin/leaves" },
              { icon: FileText, label: "View Logs", sub: "Activity history", color: "#f59e0b", href: "/admin/logs" },
            ].map(({ icon: Icon, label, sub, color, href }) => (
              <button key={label} className="qa-btn" onClick={() => window.location.href = href} style={{
                ...glass, padding: "20px", cursor: "pointer",
                border: `1px solid ${color}35`, background: `${color}12`,
                textAlign: "left", transition: "all 0.25s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 30px ${color}25`; e.currentTarget.style.borderColor = `${color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${color}25`; }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "3px" }}>{label}</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Activity Logs ── */}
        <div>
          <SectionHeader title="Recent Activity" action="View All" onAction={() => window.location.href = "/admin/logs"} />
          <div style={{ ...glass, overflow: "hidden" }}>
            {logs.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-faint)", fontSize: "14px" }}>No activity yet</div>
            ) : logs.slice(0, 8).map((log, i) => (
              <div key={log._id || i} className="log-row" style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 20px", borderBottom: "1px solid var(--divider)",
                transition: "background 0.15s",
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                  background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Activity size={14} color={isDark ? "#67e8f9" : "#0891b2"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-primary)" }}>{log.action}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>by {log.performedBy?.name || "System"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <Clock size={11} color="var(--text-faint)" />
                  <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                    {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}