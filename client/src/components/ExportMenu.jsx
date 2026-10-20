import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";

export default function ExportMenu({ onExportExcel, onExportPDF, disabled = false, label = "Export" }) {
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState(null);
    const btnRef = useRef(null);

    const handleToggle = (e) => {
        e.stopPropagation();
        if (disabled) return;
        if (!open && btnRef.current) {
            setRect(btnRef.current.getBoundingClientRect());
        }
        setOpen(v => !v);
    };

    // Close on outside CLICK (not mousedown — so buttons fire first)
    useEffect(() => {
        if (!open) return;
        const handler = () => setOpen(false);
        // Small delay so current click doesn't immediately close
        const timer = setTimeout(() => {
            document.addEventListener("click", handler);
        }, 10);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("click", handler);
        };
    }, [open]);

    const handleExcel = (e) => {
        e.stopPropagation();
        setOpen(false);
        if (onExportExcel) onExportExcel();
    };

    const handlePDF = (e) => {
        e.stopPropagation();
        setOpen(false);
        if (onExportPDF) onExportPDF();
    };

    // Dropdown rendered into document.body via portal so it's NEVER clipped
    const dropdown = open && rect ? createPortal(
        <div
            onClick={e => e.stopPropagation()}
            style={{
                position: "fixed",
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
                zIndex: 999999,
                background: "#0d1830",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                minWidth: "210px",
                overflow: "hidden",
                animation: "efadeIn 0.15s ease",
            }}
        >
            <style>{`@keyframes efadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* Header */}
            <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "rgba(148,163,184,0.6)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    Download As
                </span>
            </div>

            {/* Excel */}
            {onExportExcel && (
                <button
                    onClick={handleExcel}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "transparent", border: "none", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.12)"; e.currentTarget.style.color = "#34d399"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e2e8f0"; }}
                >
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileSpreadsheet size={16} color="#34d399" />
                    </div>
                    <div>
                        <div style={{ lineHeight: 1.3 }}>Excel (.csv)</div>
                        <div style={{ fontSize: "11px", color: "rgba(100,116,139,0.6)", fontWeight: "400", marginTop: "2px" }}>Opens in Excel / Sheets</div>
                    </div>
                </button>
            )}

            {/* PDF */}
            {onExportPDF && (
                <button
                    onClick={handlePDF}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "transparent", border: "none", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e2e8f0"; }}
                >
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={16} color="#f87171" />
                    </div>
                    <div>
                        <div style={{ lineHeight: 1.3 }}>PDF (Print)</div>
                        <div style={{ fontSize: "11px", color: "rgba(100,116,139,0.6)", fontWeight: "400", marginTop: "2px" }}>Print or save as PDF</div>
                    </div>
                </button>
            )}
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleToggle}
                disabled={disabled}
                style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: open ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${open ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "10px", padding: "10px 16px",
                    color: open ? "#5eead4" : "rgba(200,210,220,0.9)",
                    fontSize: "13px", fontWeight: "600",
                    cursor: disabled ? "default" : "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    transition: "all 0.2s",
                    opacity: disabled ? 0.5 : 1,
                    whiteSpace: "nowrap",
                }}
            >
                <Download size={15} />
                {label}
                <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {dropdown}
        </>
    );
}