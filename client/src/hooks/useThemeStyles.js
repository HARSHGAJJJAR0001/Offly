import { useTheme } from "../context/ThemeContext";

// ── Central hook — returns all theme-aware style values ───────────────────────
// Import this in every page and use t.* instead of hardcoded colors
export const useThemeStyles = () => {
    const { isDark } = useTheme();

    return {
        isDark,

        // ── Backgrounds ──────────────────────────────────────────────────────────
        pageBg: isDark ? "linear-gradient(135deg,#0a0f1e,#0d1528,#060d1a)" : "#f0f4f8",
        cardBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        cardBorder: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
        inputBg: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
        inputBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
        hoverBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        divider: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)",
        badgeBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",

        // ── Text ─────────────────────────────────────────────────────────────────
        textPrimary: isDark ? "#f0fdf4" : "#0f172a",
        textSecondary: isDark ? "#e2e8f0" : "#1e293b",
        textMuted: isDark ? "rgba(148,163,184,0.8)" : "#64748b",
        textFaint: isDark ? "rgba(100,116,139,0.6)" : "#94a3b8",
        textDisabled: isDark ? "rgba(100,116,139,0.4)" : "#cbd5e1",

        // ── Accents ──────────────────────────────────────────────────────────────
        teal: isDark ? "#14b8a6" : "#0d9488",
        purple: isDark ? "#8b5cf6" : "#7c3aed",
        blue: isDark ? "#6366f1" : "#4f46e5",
        amber: isDark ? "#f59e0b" : "#d97706",
        green: "#10b981",
        red: "#ef4444",

        // ── Shadows ──────────────────────────────────────────────────────────────
        shadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)",
        shadowLg: isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.12)",

        // ── Sidebar / Navbar ─────────────────────────────────────────────────────
        sidebarBg: isDark ? "rgba(8,13,26,0.97)" : "#ffffff",
        navbarBg: isDark ? "rgba(10,15,30,0.85)" : "rgba(255,255,255,0.95)",

        // ── Chart colors ─────────────────────────────────────────────────────────
        chartGrid: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
        chartAxis: isDark ? "rgba(100,116,139,0.5)" : "#94a3b8",
        chartTooltipBg: isDark ? "rgba(10,16,32,0.98)" : "#ffffff",

        // ── Glass card style object (spread into style prop) ─────────────────────
        glass: {
            background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
        },

        // ── Header card style ────────────────────────────────────────────────────
        headerCard: (accentColor = "#14b8a6") => ({
            background: isDark
                ? `linear-gradient(135deg,${accentColor}14,${accentColor}08)`
                : `linear-gradient(135deg,${accentColor}12,${accentColor}06)`,
            border: `1px solid ${accentColor}${isDark ? "25" : "30"}`,
            borderRadius: "20px",
            backdropFilter: "blur(12px)",
            boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.08)",
        }),

        // ── Input style object ───────────────────────────────────────────────────
        input: {
            width: "100%",
            background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
            borderRadius: "10px",
            padding: "11px 14px",
            color: isDark ? "#e2e8f0" : "#0f172a",
            fontSize: "13.5px",
            fontFamily: "'DM Sans',sans-serif",
            outline: "none",
        },

        // ── Table row style ──────────────────────────────────────────────────────
        tableHeader: {
            background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
        },

        tableRow: {
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.05)"}`,
        },
    };
};