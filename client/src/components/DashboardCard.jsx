import React from "react";
import { Users, Building2, Calendar, TrendingUp, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";

const ICONS = {
  users: Users, building: Building2, calendar: Calendar,
  trending: TrendingUp, checkcircle: CheckCircle,
};

const PALETTES = {
  blue: { accent: "#06b6d4", glow: "rgba(6,182,212,0.15)", border: "rgba(6,182,212,0.2)", text: "#67e8f9", bg: "rgba(6,182,212,0.08)" },
  green: { accent: "#10b981", glow: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.2)", text: "#6ee7b7", bg: "rgba(16,185,129,0.08)" },
  purple: { accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.2)", text: "#c4b5fd", bg: "rgba(139,92,246,0.08)" },
  orange: { accent: "#f59e0b", glow: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.2)", text: "#fcd34d", bg: "rgba(245,158,11,0.08)" },
};

export default function DashboardCard({ title, value, icon, trend, trendLabel = "vs last month", color = "blue", subtitle = "", onClick }) {
  const Icon = ICONS[icon] || Users;
  const p = PALETTES[color] || PALETTES.blue;
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-glass)",
        border: `1px solid ${hovered ? p.border : "var(--border-color)"}`,
        borderRadius: "16px", padding: "22px", cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease", position: "relative", overflow: "hidden",
        boxShadow: hovered ? `0 4px 20px ${p.glow}` : "var(--shadow-card)",
        transform: hovered ? "translateY(-2px)" : "none",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: hovered ? `linear-gradient(90deg,transparent,${p.accent}40,transparent)` : "transparent",
        transition: "all 0.3s",
      }} />

      <div style={{
        width: "44px", height: "44px", borderRadius: "12px",
        background: p.bg, border: `1px solid ${p.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "16px",
        boxShadow: hovered ? `0 0 20px ${p.glow}` : "none",
        transform: hovered ? "scale(1.08)" : "scale(1)", transition: "all 0.3s",
      }}>
        <Icon size={20} color={p.accent} />
      </div>

      <div style={{
        fontSize: "32px", fontWeight: "800", color: hovered ? p.accent : "var(--text-primary)",
        fontFamily: "'DM Serif Display',serif", letterSpacing: "-1px", lineHeight: 1,
        marginBottom: "6px", transition: "color 0.3s",
      }}>
        {typeof value === "number" ? value.toLocaleString() : (value ?? 0)}
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.5px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "2px" }}>{subtitle}</div>}
      </div>

      {trend !== undefined && trend !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "3px 8px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
            background: trend > 0 ? "rgba(16,185,129,0.1)" : trend < 0 ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.1)",
            color: trend > 0 ? "#34d399" : trend < 0 ? "#f87171" : "#94a3b8",
            border: `1px solid ${trend > 0 ? "rgba(16,185,129,0.2)" : trend < 0 ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)"}`,
          }}>
            {trend > 0 ? <ArrowUp size={11} /> : trend < 0 ? <ArrowDown size={11} /> : null}
            {Math.abs(trend)}%
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}