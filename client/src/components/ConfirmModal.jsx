import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true }) {
    if (!open) return null;
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}
            onClick={onCancel}
        >
            <div onClick={e => e.stopPropagation()} style={{
                background: "rgba(13,21,40,0.98)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px", padding: "32px", maxWidth: "420px", width: "100%",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
                animation: "fadeUp 0.2s ease",
            }}>
                <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

                <div style={{
                    width: "52px", height: "52px", borderRadius: "14px", marginBottom: "20px",
                    background: danger ? "rgba(239,68,68,0.1)" : "rgba(6,182,212,0.1)",
                    border: `1px solid ${danger ? "rgba(239,68,68,0.25)" : "rgba(6,182,212,0.25)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <AlertTriangle size={24} color={danger ? "#f87171" : "#67e8f9"} />
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px", fontFamily: "'DM Serif Display',serif" }}>
                    {title || "Are you sure?"}
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(148,163,184,0.7)", lineHeight: 1.6, marginBottom: "28px" }}>
                    {message || "This action cannot be undone."}
                </p>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button onClick={onCancel} style={{
                        padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(148,163,184,0.8)", fontSize: "13.5px", fontWeight: "600",
                        fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    >Cancel</button>
                    <button onClick={onConfirm} style={{
                        padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
                        background: danger ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#14b8a6,#06b6d4)",
                        border: "none", color: "#fff", fontSize: "13.5px", fontWeight: "700",
                        fontFamily: "'DM Sans',sans-serif",
                        boxShadow: danger ? "0 4px 20px rgba(239,68,68,0.3)" : "0 4px 20px rgba(20,184,166,0.3)",
                        transition: "all 0.15s",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >Confirm</button>
                </div>
            </div>
        </div>
    );
}