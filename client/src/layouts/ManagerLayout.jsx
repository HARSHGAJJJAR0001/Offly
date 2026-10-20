import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, User, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/manager", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/manager/employees", icon: Users, label: "My Team" },
  { path: "/manager/leaves", icon: Calendar, label: "Leave Requests" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function ManagerLayout({ children }) {
  const { isDark } = useTheme();
  const location = useLocation();
  const { user } = useAuth();

  const sidebarContent = (
    <>
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}`, display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}>
          <Zap size={15} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px" }}>Offly</div>
          <div style={{ fontSize: "10px", color: "var(--text-faint)", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase" }}>Manager</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "14px 10px" }}>
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || (path !== "/manager" && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
              borderRadius: "10px", marginBottom: "3px", textDecoration: "none",
              background: active ? (isDark ? "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(99,102,241,0.12))" : "rgba(109,40,217,0.08)") : "transparent",
              border: active ? `1px solid ${isDark ? "rgba(139,92,246,0.22)" : "rgba(109,40,217,0.2)"}` : "1px solid transparent",
              color: active ? (isDark ? "#8b5cf6" : "#6d28d9") : (isDark ? "rgba(148,163,184,0.8)" : "#475569"),
              fontSize: "13.5px", fontWeight: "600", transition: "all 0.2s", position: "relative",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--bg-glass-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; } }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />{label}
              {active && <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 6px rgba(139,92,246,0.8)" }} />}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}` }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#fff", flexShrink: 0 }}>
            {(user?.name?.[0] || "M").toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: isDark ? "#e2e8f0" : "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Manager"}</div>
            <div style={{ fontSize: "11px", color: "rgba(139,92,246,0.9)", fontWeight: "600" }}>Manager</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: isDark ? "linear-gradient(135deg,#0a0f1e,#0d1528,#0a1a2e)" : "#f0f4f8", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: "220px", flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh", background: isDark ? "rgba(8,13,26,0.97)" : "#ffffff", borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}`, flexDirection: "column", zIndex: 50, boxShadow: isDark ? "4px 0 30px rgba(0,0,0,0.4)" : "2px 0 12px rgba(0,0,0,0.08)", display: "flex" }}>
        {sidebarContent}
      </div>
      <div style={{ width: "220px", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar />
        <main className="main-content" style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}