// ── Pure browser exports — no external libraries needed ──────────────────────

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ── Download helper ───────────────────────────────────────────────────────────
const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ── CSV builder ───────────────────────────────────────────────────────────────
const toCSV = (headers, rows) => {
    const escape = (val) => {
        const str = String(val ?? "").replace(/"/g, '""');
        return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
    };
    const lines = [
        headers.map(escape).join(","),
        ...rows.map(row => row.map(escape).join(",")),
    ];
    return lines.join("\n");
};

// ── HTML/PDF-like printer ─────────────────────────────────────────────────────
const printHTML = (title, headers, rows, filename) => {
    const tableRows = rows.map(row =>
        `<tr>${row.map(cell => `<td>${String(cell ?? "—").replace(/</g, "&lt;")}</td>`).join("")}</tr>`
    ).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; }
    .header { background: linear-gradient(135deg,#0f172a,#0d9488); color: white; padding: 24px 30px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header .logo { font-size: 28px; font-weight: 900; color: #14b8a6; }
    .header .meta { font-size: 12px; opacity: 0.8; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #0d9488; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 700; font-size: 12px; letter-spacing: 0.3px; }
    tbody tr:nth-child(even) { background: #f0fdfa; }
    tbody tr:hover { background: #e0fdf4; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 15px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">⚡ Offly</div>
      <h1>${title}</h1>
      <div class="meta">Generated: ${new Date().toLocaleString()} · Total: ${rows.length} records</div>
    </div>
    <div style="font-size:13px;opacity:0.8;">HR Management System</div>
  </div>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">Offly HR Management System · Confidential · Page 1</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to export PDF"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
};

// ════════════════════════════════════════════════════════════════════════════
//  EMPLOYEE EXPORTS
// ════════════════════════════════════════════════════════════════════════════
export const exportEmployeesToExcel = (employees) => {
    const headers = ["#", "Name", "Email", "Role", "Department", "Phone", "Joined"];
    const rows = employees.map((e, i) => [
        i + 1,
        e.name || "—",
        e.email || "—",
        e.role || "—",
        e.departmentId?.name || "—",
        e.phone || "—",
        fmtDate(e.createdAt),
    ]);
    const csv = toCSV(headers, rows);
    downloadFile("\uFEFF" + csv, `Offly_Employees_${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8;");
};

export const exportEmployeesToPDF = (employees) => {
    const headers = ["#", "Name", "Email", "Role", "Department", "Phone", "Joined"];
    const rows = employees.map((e, i) => [
        i + 1, e.name || "—", e.email || "—", e.role || "—",
        e.departmentId?.name || "—", e.phone || "—", fmtDate(e.createdAt),
    ]);
    printHTML("Employee Report", headers, rows);
};

// ════════════════════════════════════════════════════════════════════════════
//  LEAVE EXPORTS
// ════════════════════════════════════════════════════════════════════════════
export const exportLeavesToExcel = (leaves) => {
    const headers = ["#", "Employee", "Email", "Department", "Leave Type", "Start Date", "End Date", "Days", "Reason", "Status", "Reviewed By", "Applied On"];
    const rows = leaves.map((l, i) => {
        const days = l.startDate && l.endDate
            ? Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1
            : "—";
        return [
            i + 1,
            l.userId?.name || "—",
            l.userId?.email || "—",
            l.departmentId?.name || "—",
            l.leaveType || "—",
            fmtDate(l.startDate),
            fmtDate(l.endDate),
            days,
            l.reason || "—",
            l.status || "—",
            l.reviewedBy?.name || "—",
            fmtDate(l.createdAt),
        ];
    });
    const csv = toCSV(headers, rows);
    downloadFile("\uFEFF" + csv, `Offly_Leaves_${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8;");
};

export const exportLeavesToPDF = (leaves) => {
    const headers = ["#", "Employee", "Department", "Type", "Start", "End", "Days", "Status", "Applied"];
    const rows = leaves.map((l, i) => {
        const days = l.startDate && l.endDate
            ? Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1
            : "—";
        return [
            i + 1, l.userId?.name || "—", l.departmentId?.name || "—",
            l.leaveType || "—", fmtDate(l.startDate), fmtDate(l.endDate),
            days, l.status || "—", fmtDate(l.createdAt),
        ];
    });
    printHTML("Leave Requests Report", headers, rows);
};

// ════════════════════════════════════════════════════════════════════════════
//  ACTIVITY LOG EXPORTS
// ════════════════════════════════════════════════════════════════════════════
export const exportLogsToExcel = (logs) => {
    const headers = ["#", "Action", "Performed By", "Role", "Details", "Date & Time"];
    const rows = logs.map((l, i) => [
        i + 1,
        l.action || "—",
        l.performedBy?.name || "—",
        l.performedBy?.role || "—",
        l.details || "—",
        fmtDateTime(l.createdAt),
    ]);
    const csv = toCSV(headers, rows);
    downloadFile("\uFEFF" + csv, `Offly_ActivityLogs_${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8;");
};

export const exportLogsToPDF = (logs) => {
    const headers = ["#", "Action", "Performed By", "Role", "Details", "Date & Time"];
    const rows = logs.map((l, i) => [
        i + 1, l.action || "—", l.performedBy?.name || "—",
        l.performedBy?.role || "—", l.details || "—", fmtDateTime(l.createdAt),
    ]);
    printHTML("Activity Logs Report", headers, rows);
};