export function isWithinDateRange(dateValue, startDate, endDate) {
  if (!dateValue) return !startDate && !endDate;

  const entryDate = toDateOnlyTime(dateValue);
  const startTime = startDate ? toDateOnlyTime(startDate) : null;
  const endTime = endDate ? toDateOnlyTime(endDate) : null;

  if (entryDate === null) return false;
  if (startTime !== null && entryDate < startTime) return false;
  if (endTime !== null && entryDate > endTime) return false;
  return true;
}

export function openPdfReport({
  title,
  records,
  startDate,
  endDate,
  total,
  formatAmount,
  formatDate,
}) {
  const reportWindow = window.open("", "_blank", "width=1100,height=800");

  if (!reportWindow) {
    alert("Please allow popups to download the PDF report.");
    return;
  }

  const rangeLabel = getRangeLabel(startDate, endDate, formatDate);
  const rows = records
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(formatDate(item.date))}</td>
          <td>${escapeHtml(item.name || "-")}</td>
          <td>${escapeHtml(item.purpose || "-")}</td>
          <td>${escapeHtml(item.remarks || "-")}</td>
          <td class="amount">${escapeHtml(formatAmount(item.amount || 0))}</td>
        </tr>
      `
    )
    .join("");

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            color: #111827;
            font-family: Arial, sans-serif;
            margin: 32px;
          }

          h1 {
            font-size: 24px;
            margin: 0 0 6px;
          }

          .meta {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 24px;
          }

          .summary {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 12px 16px;
          }

          table {
            border-collapse: collapse;
            font-size: 12px;
            width: 100%;
          }

          th,
          td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f9fafb;
            color: #374151;
          }

          .amount {
            text-align: right;
            white-space: nowrap;
          }

          .empty {
            border: 1px solid #e5e7eb;
            color: #6b7280;
            padding: 24px;
            text-align: center;
          }

          @media print {
            body { margin: 18mm; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Date range: ${escapeHtml(rangeLabel)}</div>
        <div class="summary">
          <strong>Total Records: ${records.length}</strong>
          <strong>Total Amount: ${escapeHtml(formatAmount(total))}</strong>
        </div>
        ${
          records.length
            ? `<table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Purpose</th>
                    <th>Remarks</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>`
            : `<div class="empty">No records found for the selected date range.</div>`
        }
        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}

function getRangeLabel(startDate, endDate, formatDate) {
  if (startDate && endDate) {
    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  }

  if (startDate) return `From ${formatDate(startDate)}`;
  if (endDate) return `Up to ${formatDate(endDate)}`;
  return "All dates";
}

function toDateOnlyTime(value) {
  const date = parseDateValue(value);
  if (!date) return null;

  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function parseDateValue(value) {
  if (value instanceof Date) return new Date(value);

  const rawValue = String(value || "").trim();
  const yyyyMmDd = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyyMmDd) {
    return new Date(
      Number(yyyyMmDd[1]),
      Number(yyyyMmDd[2]) - 1,
      Number(yyyyMmDd[3])
    );
  }

  const ddMmYyyy = rawValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddMmYyyy) {
    return new Date(
      Number(ddMmYyyy[3]),
      Number(ddMmYyyy[2]) - 1,
      Number(ddMmYyyy[1])
    );
  }

  const parsedDate = new Date(rawValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
