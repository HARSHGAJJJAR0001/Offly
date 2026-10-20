import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Settings, User, LogOut, ChevronDown, X, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ROLE_CFG = {
    admin: { label: "Super Admin", color: "#14b8a6", bg: "linear-gradient(135deg,#14b8a6,#06b6d4)" },
    manager: { label: "Manager", color: "#8b5cf6", bg: "linear-gradient(135deg,#8b5cf6,#6366f1)" },
    employee: { label: "Employee", color: "#f59e0b", bg: "linear-gradient(135deg,#f59e0b,#f97316)" },
};

function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const roleCfg = ROLE_CFG[user?.role] || ROLE_CFG.employee;
    const initials = getInitials(user?.name);

    const [showUser, setShowUser] = useState(false);
    const [search, setSearch] = useState("");

    const handleLogout = () => { setShowUser(false); logout(); };

    // All colors computed from isDark — no hardcoded dark values
    const C = {
        navBg: isDark ? "rgba(10,15,30,0.92)" : "#ffffff",
        navBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
        navShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 1px 8px rgba(0,0,0,0.07)",
        searchBg: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
        searchBrd: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
        searchClr: isDark ? "#e2e8f0" : "#1e293b",
        iconBg: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
        iconBrd: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
        iconClr: isDark ? "rgba(148,163,184,0.8)" : "#475569",
        pillBg: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
        pillBrd: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
        pillClr: isDark ? "#e2e8f0" : "#1e293b",
        divider: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
        dropBg: isDark ? "rgba(10,16,32,0.98)" : "#ffffff",
        dropBrd: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
        dropShadow: isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.12)",
        dropDivider: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
        menuTxt: isDark ? "rgba(148,163,184,0.8)" : "#475569",
        menuHoverBg: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
        menuHoverClr: isDark ? "#e2e8f0" : "#0f172a",
        nameTxt: isDark ? "#e2e8f0" : "#0f172a",
        emailTxt: isDark ? "rgba(100,116,139,0.7)" : "#94a3b8",
        logoutClr: isDark ? "rgba(248,113,113,0.7)" : "#dc2626",
    };

    const iconStyle = {
        width: "36px", height: "36px", borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: C.iconBg, border: `1px solid ${C.iconBrd}`,
        cursor: "pointer", color: C.iconClr, transition: "all 0.2s",
    };

    return (
        <header style={{
            height: "60px",
            background: C.navBg,
            backdropFilter: isDark ? "blur(20px)" : "none",
            borderBottom: `1px solid ${C.navBorder}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px 0 28px",
            position: "sticky", top: 0, zIndex: 30,
            boxShadow: C.navShadow,
            fontFamily: "'DM Sans',sans-serif",
        }}>

            {/* Search */}
            <div className="navbar-search" style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: C.searchBg, border: `1px solid ${C.searchBrd}`,
                borderRadius: "12px", padding: "8px 14px", width: "260px",
            }}>
                <Search size={15} color={isDark ? "rgba(100,116,139,0.7)" : "#94a3b8"} />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search anything..."
                    style={{ background: "none", border: "none", outline: "none", color: C.searchClr, fontSize: "13.5px", width: "100%", fontFamily: "'DM Sans',sans-serif" }}
                />
                {search && <X size={14} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"}
                    style={{ ...iconStyle, background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9", color: isDark ? "#fbbf24" : "#6366f1" }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(251,191,36,0.12)" : "rgba(99,102,241,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"; }}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Settings */}
                <button onClick={() => navigate("/profile")} style={iconStyle}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)"; e.currentTarget.style.color = "#818cf8"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.iconBg; e.currentTarget.style.color = C.iconClr; }}
                >
                    <Settings size={16} />
                </button>

                <div style={{ width: "1px", height: "24px", background: C.divider, margin: "0 4px" }} />

                {/* User pill */}
                <div style={{ position: "relative" }}>
                    <button onClick={() => setShowUser(v => !v)} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        background: C.pillBg, border: `1px solid ${C.pillBrd}`,
                        borderRadius: "12px", padding: "6px 12px 6px 8px",
                        cursor: "pointer", transition: "all 0.2s", color: C.pillClr,
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.pillBg; }}
                    >
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0, background: roleCfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#fff" }}>{initials}</div>
                        <div className="navbar-user-name" style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: 1.2, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.pillClr }}>{user?.name || "User"}</div>
                            <div style={{ fontSize: "11px", color: roleCfg.color, fontWeight: "600" }}>{roleCfg.label}</div>
                        </div>
                        <ChevronDown size={13} color={isDark ? "rgba(100,116,139,0.6)" : "#94a3b8"} />
                    </button>

                    {/* Dropdown */}
                    {showUser && (
                        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: C.dropBg, border: `1px solid ${C.dropBrd}`, borderRadius: "16px", backdropFilter: isDark ? "blur(32px)" : "none", boxShadow: C.dropShadow, zIndex: 200, overflow: "hidden", width: "230px" }}>

                            {/* Header */}
                            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.dropDivider}`, display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: roleCfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "#fff" }}>{initials}</div>
                                <div style={{ overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", fontWeight: "700", color: C.nameTxt, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
                                    <div style={{ fontSize: "11px", color: C.emailTxt, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
                                    <div style={{ display: "inline-block", marginTop: "4px", padding: "2px 8px", borderRadius: "20px", background: `${roleCfg.color}20`, color: roleCfg.color, fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>{roleCfg.label}</div>
                                </div>
                            </div>

                            {/* Profile */}
                            <button onClick={() => { navigate("/profile"); setShowUser(false); }}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", background: "none", border: "none", color: C.menuTxt, fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.menuHoverBg; e.currentTarget.style.color = C.menuHoverClr; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.menuTxt; }}
                            ><User size={14} /> Profile</button>

                            {/* Change Password */}
                            <button onClick={() => { navigate("/change-password"); setShowUser(false); }}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", background: "none", border: "none", color: C.menuTxt, fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.menuHoverBg; e.currentTarget.style.color = C.menuHoverClr; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.menuTxt; }}
                            ><Settings size={14} /> Change Password</button>

                            <div style={{ height: "1px", background: C.dropDivider, margin: "4px 0" }} />

                            {/* Logout */}
                            <button onClick={handleLogout}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", background: "none", border: "none", color: C.logoutClr, fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = isDark ? "#f87171" : "#b91c1c"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.logoutClr; }}
                            ><LogOut size={14} /> Sign Out</button>

                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}