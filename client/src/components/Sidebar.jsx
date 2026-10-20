import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Calendar, LogOut, Menu, X, Zap, ClipboardList, BarChart2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_BY_ROLE = {
  admin: [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/departments", icon: Building2, label: "Departments" },
    { path: "/admin/employees", icon: Users, label: "Employees" },
    { path: "/admin/leaves", icon: Calendar, label: "Leave Requests" },
    { path: "/admin/logs", icon: ClipboardList, label: "Activity Logs" },
    { path: "/admin/analytics", icon: BarChart2, label: "Dept Analytics" },
  ],
  manager: [
    { path: "/manager", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/manager/employees", icon: Users, label: "My Team" },
    { path: "/manager/leaves", icon: Calendar, label: "Leave Requests" },
  ],
  employee: [
    { path: "/employee", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/employee/apply-leave", icon: Calendar, label: "Apply Leave" },
    { path: "/employee/my-leaves", icon: ClipboardList, label: "My Leaves" },
  ],
};

const ROLE_CFG = {
  admin: { color: "#14b8a6", bg: "linear-gradient(135deg,#14b8a6,#06b6d4)", label: "Super Admin" },
  manager: { color: "#8b5cf6", bg: "linear-gradient(135deg,#8b5cf6,#6366f1)", label: "Manager" },
  employee: { color: "#f59e0b", bg: "linear-gradient(135deg,#f59e0b,#f97316)", label: "Employee" },
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  const roleCfg = ROLE_CFG[user?.role] || ROLE_CFG.employee;
  const initials = getInitials(user?.name);
  const navItems = NAV_BY_ROLE[user?.role] || [];

  const sidebarStyle = {
    width: "240px",
    height: "100vh",
    background: isDark ? "rgba(8,13,26,0.97)" : "#ffffff",
    borderRight: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)",
    backdropFilter: "blur(24px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 40px rgba(0,0,0,0.4)",
    overflow: "hidden",
  };

  const navItemStyle = (active) => ({
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 12px", borderRadius: "10px", marginBottom: "2px",
    cursor: "pointer", textDecoration: "none",
    transition: "all 0.2s ease", position: "relative",
    background: active ? "linear-gradient(135deg,rgba(20,184,166,0.15),rgba(6,182,212,0.1))" : "transparent",
    border: active ? "1px solid rgba(20,184,166,0.18)" : "1px solid transparent",
    color: active ? "var(--accent-teal)" : "var(--text-muted)",
  });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg,#14b8a6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(20,184,166,0.35)" }}>
          <Zap size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#f0fdf4", fontFamily: "'DM Serif Display',serif", letterSpacing: "-0.5px", lineHeight: 1.1 }}>Offly</div>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>{roleCfg.label} Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(100,116,139,0.5)", letterSpacing: "1.5px", padding: "0 12px 10px", textTransform: "uppercase" }}>Navigation</div>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || (path.split("/").length > 2 && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={navItemStyle(active)}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--bg-glass-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; } }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "13.5px", fontWeight: "600", whiteSpace: "nowrap" }}>{label}</span>
              {active && (
                <div style={{ position: "absolute", right: "12px", width: "6px", height: "6px", borderRadius: "50%", background: "#14b8a6", boxShadow: "0 0 8px rgba(20,184,166,0.8)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}`, marginBottom: "8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0, background: roleCfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#fff" }}>{initials}</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
            <div style={{ fontSize: "11px", color: roleCfg.color, fontWeight: "600" }}>{roleCfg.label}</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "transparent", border: "1px solid transparent", cursor: "pointer", color: isDark ? "rgba(248,113,113,0.6)" : "#dc2626", width: "100%", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = isDark ? "#f87171" : "#dc2626"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDark ? "rgba(248,113,113,0.6)" : "#dc2626"; e.currentTarget.style.borderColor = "transparent"; }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} /><span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — fixed, no toggle button */}
      <div className="sidebar-desktop" style={{ ...sidebarStyle, position: "fixed", top: 0, left: 0, zIndex: 50 }}>
        <SidebarContent />
      </div>
      {/* Spacer for desktop */}
      <div className="sidebar-spacer" style={{ width: "240px", flexShrink: 0 }} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 40 }} />
      )}

      {/* Mobile sidebar */}
      <div className="sidebar-mobile-overlay" style={{ ...sidebarStyle, position: "fixed", top: 0, left: 0, zIndex: 50, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#94a3b8" }}>
          <X size={16} />
        </button>
        <SidebarContent />
      </div>

      {/* Mobile hamburger */}
      <button className="sidebar-mobile-overlay" onClick={() => setMobileOpen(true)} style={{ position: "fixed", top: "12px", left: "12px", zIndex: 30, padding: "10px", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", border: "none", borderRadius: "10px", cursor: "pointer", color: "#fff", boxShadow: "0 4px 20px rgba(20,184,166,0.4)" }}>
        <Menu size={18} />
      </button>
    </>
  );
}