// ── Base shimmer animation ────────────────────────────────────────────────────
const shimmerStyle = {
    background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "6px",
};

const style = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

// ── Primitive ─────────────────────────────────────────────────────────────────
export function SkeletonBox({ width = "100%", height = "16px", radius = "6px", style: extra = {} }) {
    return (
        <>
            <style>{style}</style>
            <div style={{ ...shimmerStyle, width, height, borderRadius: radius, flexShrink: 0, ...extra }} />
        </>
    );
}

// ── Dashboard KPI card skeleton ───────────────────────────────────────────────
export function SkeletonCard() {
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px", padding: "22px", animation: "fadeIn 0.3s ease",
        }}>
            <style>{style}</style>
            {/* Icon */}
            <div style={{ ...shimmerStyle, width: "44px", height: "44px", borderRadius: "12px", marginBottom: "16px" }} />
            {/* Value */}
            <div style={{ ...shimmerStyle, width: "60px", height: "36px", borderRadius: "8px", marginBottom: "10px" }} />
            {/* Title */}
            <div style={{ ...shimmerStyle, width: "110px", height: "14px", marginBottom: "6px" }} />
            <div style={{ ...shimmerStyle, width: "80px", height: "12px", marginBottom: "14px" }} />
            {/* Trend */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ ...shimmerStyle, width: "50px", height: "22px", borderRadius: "99px" }} />
                <div style={{ ...shimmerStyle, width: "80px", height: "12px" }} />
            </div>
        </div>
    );
}

// ── Table row skeleton ────────────────────────────────────────────────────────
export function SkeletonTableRow({ cols = 4 }) {
    const widths = ["40px", "180px", "140px", "100px", "80px", "60px"];
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
            <style>{style}</style>
            {Array.from({ length: cols }).map((_, i) => (
                <div key={i} style={{ ...shimmerStyle, width: widths[i] || "100px", height: "14px", flexShrink: i === 0 ? 0 : undefined, flex: i === 0 ? "none" : 1 }} />
            ))}
        </div>
    );
}

// ── Table skeleton (header + rows) ────────────────────────────────────────────
export function SkeletonTable({ rows = 6, cols = 4 }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
            <style>{style}</style>
            {/* Header */}
            <div style={{ display: "flex", gap: "16px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} style={{ ...shimmerStyle, width: i === 0 ? "40px" : "100px", height: "12px", flex: i === 0 ? "none" : 1 }} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} cols={cols} />
            ))}
        </div>
    );
}

// ── Employee card skeleton ────────────────────────────────────────────────────
export function SkeletonEmployeeCard() {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "22px", animation: "fadeIn 0.3s ease" }}>
            <style>{style}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                <div style={{ ...shimmerStyle, width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ ...shimmerStyle, width: "120px", height: "16px", marginBottom: "8px" }} />
                    <div style={{ ...shimmerStyle, width: "70px", height: "12px" }} />
                </div>
            </div>
            <div style={{ ...shimmerStyle, width: "160px", height: "12px", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ ...shimmerStyle, flex: 1, height: "34px", borderRadius: "8px" }} />
                <div style={{ ...shimmerStyle, flex: 1, height: "34px", borderRadius: "8px" }} />
            </div>
        </div>
    );
}

// ── Activity log row skeleton ─────────────────────────────────────────────────
export function SkeletonLogRow() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <style>{style}</style>
            <div style={{ ...shimmerStyle, width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ ...shimmerStyle, width: "200px", height: "14px", marginBottom: "6px" }} />
                <div style={{ ...shimmerStyle, width: "120px", height: "12px" }} />
            </div>
            <div style={{ ...shimmerStyle, width: "100px", height: "12px" }} />
        </div>
    );
}

// ── Dashboard full skeleton ───────────────────────────────────────────────────
export function SkeletonDashboard() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" }}>
            <style>{style}</style>
            {/* Hero */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "32px" }}>
                <div style={{ ...shimmerStyle, width: "180px", height: "14px", marginBottom: "16px" }} />
                <div style={{ ...shimmerStyle, width: "300px", height: "40px", borderRadius: "8px", marginBottom: "12px" }} />
                <div style={{ ...shimmerStyle, width: "220px", height: "16px", marginBottom: "24px" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                    {[120, 110, 90].map((w, i) => (
                        <div key={i} style={{ ...shimmerStyle, width: `${w}px`, height: "42px", borderRadius: "10px" }} />
                    ))}
                </div>
            </div>

            {/* KPI cards */}
            <div>
                <div style={{ ...shimmerStyle, width: "120px", height: "16px", marginBottom: "14px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {[1, 2].map(i => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "24px", height: "200px" }}>
                        <div style={{ ...shimmerStyle, width: "150px", height: "16px", marginBottom: "8px" }} />
                        <div style={{ ...shimmerStyle, width: "100px", height: "12px", marginBottom: "20px" }} />
                        <div style={{ ...shimmerStyle, width: "100%", height: "120px", borderRadius: "10px" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Page header skeleton ──────────────────────────────────────────────────────
export function SkeletonHeader() {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeIn 0.3s ease" }}>
            <style>{style}</style>
            <div>
                <div style={{ ...shimmerStyle, width: "200px", height: "30px", borderRadius: "8px", marginBottom: "10px" }} />
                <div style={{ ...shimmerStyle, width: "150px", height: "14px" }} />
            </div>
            <div style={{ ...shimmerStyle, width: "140px", height: "40px", borderRadius: "10px" }} />
        </div>
    );
}