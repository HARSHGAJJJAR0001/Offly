import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages, total, limit, hasNext, hasPrev } = pagination;

    // Build page numbers to show — always show first, last, current ±1
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= page - delta && i <= page + delta)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }

    const btn = (active) => ({
        width: "36px", height: "36px", borderRadius: "9px",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
        fontSize: "13px", fontWeight: "600", border: "none",
        transition: "all 0.15s",
        background: active
            ? "linear-gradient(135deg,#14b8a6,#06b6d4)"
            : "var(--bg-glass)",
        color: active ? "#fff" : "rgba(148,163,184,0.7)",
        boxShadow: active ? "0 4px 16px rgba(20,184,166,0.3)" : "none",
    });

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "12px", marginTop: "16px",
            padding: "14px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
        }}>
            {/* Info */}
            <span style={{ fontSize: "13px", color: "var(--text-faint)", fontFamily: "'DM Sans',sans-serif" }}>
                Showing <strong style={{ color: "#e2e8f0" }}>{start}–{end}</strong> of <strong style={{ color: "#e2e8f0" }}>{total}</strong> results
            </span>

            {/* Pages */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Prev */}
                <button
                    onClick={() => hasPrev && onPageChange(page - 1)}
                    disabled={!hasPrev}
                    style={{
                        ...btn(false),
                        opacity: hasPrev ? 1 : 0.3,
                        cursor: hasPrev ? "pointer" : "default",
                    }}
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`dots-${i}`} style={{ color: "rgba(100,116,139,0.4)", fontSize: "13px", padding: "0 4px" }}>…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            style={btn(p === page)}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => hasNext && onPageChange(page + 1)}
                    disabled={!hasNext}
                    style={{
                        ...btn(false),
                        opacity: hasNext ? 1 : 0.3,
                        cursor: hasNext ? "pointer" : "default",
                    }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}