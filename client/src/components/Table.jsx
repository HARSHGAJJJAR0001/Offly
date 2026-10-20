import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function Table({ columns = [], data = [], onRowClick, emptyText = "No data found." }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const cmp = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
    });

    const gridCols = columns.map(c => c.width || "1fr").join(" ");

    return (
        <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", backdropFilter: "blur(12px)", overflow: "hidden",
            fontFamily: "'DM Sans',sans-serif",
        }}>
            <style>{`.tbl-row:hover{background:rgba(255,255,255,0.04)!important;cursor:${onRowClick ? "pointer" : "default"}}.sort-btn:hover{color:#67e8f9!important}`}</style>

            {/* Header */}
            <div style={{
                display: "grid", gridTemplateColumns: `40px ${gridCols}`,
                padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
            }}>
                <span style={{ fontSize: "11px", color: "rgba(100,116,139,0.5)", fontWeight: "700", letterSpacing: "0.8px" }}>#</span>
                {columns.map(col => (
                    <div key={col.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(100,116,139,0.55)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{col.label}</span>
                        {col.sortable && (
                            <button className="sort-btn" onClick={() => handleSort(col.key)} style={{
                                background: "none", border: "none", cursor: "pointer", padding: "2px",
                                color: sortKey === col.key ? "#67e8f9" : "rgba(100,116,139,0.4)",
                                display: "flex", alignItems: "center", transition: "color 0.15s",
                            }}>
                                {sortKey === col.key ? (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronsUpDown size={13} />}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Body */}
            {sorted.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(100,116,139,0.45)", fontSize: "14px" }}>
                    {emptyText}
                </div>
            ) : sorted.map((row, i) => (
                <div key={row._id || row.id || i} className="tbl-row" onClick={() => onRowClick?.(row)} style={{
                    display: "grid", gridTemplateColumns: `40px ${gridCols}`,
                    padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.035)",
                    alignItems: "center", transition: "background 0.15s",
                }}>
                    <span style={{ fontSize: "12px", color: "rgba(100,116,139,0.38)", fontWeight: "600" }}>{String(i + 1).padStart(2, "0")}</span>
                    {columns.map(col => (
                        <div key={col.key} style={{ fontSize: "13.5px", color: "#d1d5db", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}