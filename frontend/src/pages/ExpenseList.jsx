import { useEffect, useState } from "react";
import API from "../services/api";
import {
  isWithinDateRange,
  openPdfReport,
  parseDateValue,
} from "../services/reportPdf";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .expense-root {
    min-height: 100vh;
    background: #0a0a0f;
    font-family: 'DM Mono', monospace;
    color: #e8e6e0;
    padding: 48px 32px;
    position: relative;
    overflow: hidden;
  }

  .expense-root::before {
    content: '';
    position: fixed;
    top: -40%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255,180,50,0.07) 0%, transparent 65%);
    pointer-events: none;
  }

  .expense-root::after {
    content: '';
    position: fixed;
    bottom: -30%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(100,200,255,0.05) 0%, transparent 65%);
    pointer-events: none;
  }

  .expense-container {
    max-width: 100%;
    position: relative;
    z-index: 1;
  }

  .expense-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .header-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #f5a623;
    margin-bottom: 8px;
    opacity: 0.9;
  }

  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    color: #f0ede6;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .header-title span { color: #f5a623; }

  .header-meta { text-align: right; }

  .entry-count {
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(232,230,224,0.4);
    text-transform: uppercase;
  }

  .entry-count strong {
    font-size: 28px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    color: #e8e6e0;
    display: block;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 4px;
  }

  /* Metric Cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .metric-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 20px 24px;
    transition: border-color 0.2s ease;
  }

  .metric-card:hover {
    border-color: rgba(245,166,35,0.2);
  }

  .metric-card-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(232,230,224,0.4);
    margin-bottom: 10px;
  }

  .metric-card-value {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #f0ede6;
    letter-spacing: -0.02em;
  }

  .metric-card-value.amber { color: #f5a623; }

  /* Total Bar */
  .total-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(245,166,35,0.08);
    border: 1px solid rgba(245,166,35,0.2);
    border-radius: 12px;
    padding: 16px 24px;
    margin-bottom: 28px;
  }

  .total-bar-label {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(232,230,224,0.5);
    flex: 1;
  }

  .total-bar-amount {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #f5a623;
    letter-spacing: -0.02em;
  }

  .total-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f5a623;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
  }

  /* Search */
  .search-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 12px 18px;
    margin-bottom: 16px;
    transition: border-color 0.2s ease;
  }

  .search-wrap:focus-within {
    border-color: rgba(245,166,35,0.3);
  }

  .search-icon {
    font-size: 14px;
    color: rgba(232,230,224,0.3);
    flex-shrink: 0;
  }

  .search-input {
    background: transparent;
    border: none;
    outline: none;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #e8e6e0;
    width: 100%;
  }

  .search-input::placeholder { color: rgba(232,230,224,0.25); }

  .report-controls {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    margin-bottom: 16px;
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .date-field label {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(232,230,224,0.42);
  }

  .date-input {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    color: #e8e6e0;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    padding: 12px 14px;
  }

  .date-input:focus {
    border-color: rgba(245,166,35,0.3);
  }

  .download-btn {
    align-self: end;
    background: #f5a623;
    border: none;
    border-radius: 10px;
    color: #0a0a0f;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    min-height: 43px;
    padding: 0 18px;
    text-transform: uppercase;
  }

  .download-btn:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  /* Table */
  .table-wrap {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
  }

  .expense-table {
    width: 100%;
    border-collapse: collapse;
  }

  .expense-table thead tr {
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .expense-table th {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(232,230,224,0.4);
    padding: 16px 20px;
    text-align: left;
    white-space: nowrap;
  }

  .expense-table th.align-right { text-align: right; }

  .expense-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s ease;
    animation: rowIn 0.35s ease both;
  }

  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .expense-table tbody tr:hover { background: rgba(245,166,35,0.04); }
  .expense-table tbody tr:last-child { border-bottom: none; }

  .expense-table td {
    padding: 18px 20px;
    font-size: 13px;
    color: rgba(232,230,224,0.75);
    vertical-align: middle;
  }

  .cell-date {
    font-size: 11px;
    letter-spacing: 0.05em;
    color: rgba(232,230,224,0.4);
    white-space: nowrap;
  }

  .cell-name {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #f0ede6;
    letter-spacing: -0.01em;
  }

  .cell-amount {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #f5a623;
    text-align: right;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .cell-running {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: rgba(245,166,35,0.5);
    text-align: right;
    white-space: nowrap;
  }

  .cell-purpose {
    display: inline-block;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(100,200,255,0.08);
    color: rgba(100,200,255,0.8);
    border: 1px solid rgba(100,200,255,0.15);
    border-radius: 6px;
    padding: 4px 10px;
  }

  .cell-remarks {
    font-size: 12px;
    color: rgba(232,230,224,0.4);
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Footer */
  .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }

  .table-footer-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(232,230,224,0.3);
  }

  /* States */
  .empty-state {
    text-align: center;
    padding: 72px 24px;
    color: rgba(232,230,224,0.25);
  }

  .empty-state svg { margin-bottom: 16px; opacity: 0.3; }

  .empty-state p {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .loading-state {
    text-align: center;
    padding: 72px 24px;
    color: rgba(232,230,224,0.3);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .loading-bar {
    width: 120px;
    height: 2px;
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
    margin: 16px auto 0;
    overflow: hidden;
    position: relative;
  }

  .loading-bar::after {
    content: '';
    position: absolute;
    left: -40%;
    top: 0;
    width: 40%;
    height: 100%;
    background: #f5a623;
    border-radius: 2px;
    animation: loading 1s ease infinite;
  }

  @keyframes loading {
    0%   { left: -40%; }
    100% { left: 100%; }
  }

  .error-state {
    text-align: center;
    padding: 48px;
    color: rgba(255,100,100,0.6);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  @media (max-width: 700px) {
    .expense-root { padding: 24px 16px; }
    .expense-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .header-meta { text-align: left; }
    .metrics-grid { grid-template-columns: 1fr 1fr; }
    .report-controls { grid-template-columns: 1fr; }
    .expense-table th:nth-child(5),
    .expense-table td:nth-child(5),
    .expense-table th:nth-child(6),
    .expense-table td:nth-child(6) { display: none; }
  }
`;

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = parseDateValue(dateStr);
  if (!d) return dateStr;

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("expense/list/");
      const data = Array.isArray(response.data) ? response.data : [];
      setExpenses(data);
      if (!Array.isArray(response.data)) {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      setError("Failed to load expenses. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const dateFiltered = expenses.filter((item) =>
    isWithinDateRange(item.date, startDate, endDate)
  );

  const filtered = dateFiltered.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  const total = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0), 0
  );

  const reportTotal = dateFiltered.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0), 0
  );

  const latestDate = expenses.length
    ? formatDate(expenses[expenses.length - 1].date)
    : "—";

  let runningTotal = 0;

  const downloadExpenseReport = () => {
    openPdfReport({
      title: "Expense Report",
      records: dateFiltered,
      startDate,
      endDate,
      total: reportTotal,
      formatAmount,
      formatDate,
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="expense-root">
        <div className="expense-container">

          {/* Header */}
          <div className="expense-header">
            <div className="header-left">
              <div className="header-label">Finance Tracker</div>
              <h1 className="header-title">Expense<span>.</span></h1>
            </div>
            <div className="header-meta">
              <span className="entry-count">
                <strong>{expenses.length}</strong>
                entries
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          {!loading && !error && (
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-card-label">Total Spent</div>
                <div className="metric-card-value amber">
                  {formatAmount(total)}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-label">Transactions</div>
                <div className="metric-card-value">{expenses.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-card-label">Latest Entry</div>
                <div className="metric-card-value">{latestDate}</div>
              </div>
            </div>
          )}

          {/* Total Bar */}
          {!loading && !error && expenses.length > 0 && (
            <div className="total-bar">
              <div className="total-dot" />
              <span className="total-bar-label">Total Spent</span>
              <span className="total-bar-amount">{formatAmount(total)}</span>
            </div>
          )}

          {/* Date Range Download */}
          <div className="report-controls">
            <div className="date-field">
              <label htmlFor="expense-start-date">Start Date</label>
              <input
                id="expense-start-date"
                className="date-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-field">
              <label htmlFor="expense-end-date">End Date</label>
              <input
                id="expense-end-date"
                className="date-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="download-btn"
              type="button"
              disabled={loading || Boolean(error)}
              onClick={downloadExpenseReport}
            >
              Download PDF
            </button>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Purpose</th>
                  <th>Remarks</th>
                  <th className="align-right">Amount</th>
                  <th className="align-right">Running Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="loading-state">
                        Fetching records
                        <div className="loading-bar" />
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="error-state">{error}</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M3 10h18M8 3v4M16 3v4" />
                        </svg>
                        <p>No expenses found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, i) => {
                    runningTotal += parseFloat(item.amount || 0);
                    return (
                      <tr
                        key={item.id}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <td className="cell-date">{formatDate(item.date)}</td>
                        <td className="cell-name">{item.name}</td>
                        <td>
                          <span className="cell-purpose">
                            {item.purpose || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="cell-remarks">
                            {item.remarks || "—"}
                          </span>
                        </td>
                        <td className="cell-amount">
                          {formatAmount(item.amount)}
                        </td>
                        <td className="cell-running">
                          {formatAmount(runningTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Footer */}
            {!loading && !error && (
              <div className="table-footer">
                <span className="table-footer-label">
                  {filtered.length} of {expenses.length} entries
                </span>
                <span className="table-footer-label">
                  {formatAmount(reportTotal)}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
