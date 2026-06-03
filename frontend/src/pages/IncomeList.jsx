import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { isWithinDateRange, openPdfReport } from "../services/reportPdf";

function IncomeList() {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadIncome();
  }, []);

  const loadIncome = async () => {
    setError(null);
    try {
      const response = await API.get("income/list/");
      const data = Array.isArray(response.data) ? response.data : [];
      setIncomes(data);
      if (!Array.isArray(response.data)) {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Failed to load income:", err);
      setError("Failed to load income. Check your backend and network connection.");
    } finally {
      setLoading(false);
    }
  };

  const dateFiltered = incomes.filter((item) =>
    isWithinDateRange(item.date, startDate, endDate)
  );

  const filtered = dateFiltered.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  let runningTotal = 0;
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const reportTotal = dateFiltered.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const latestDate = incomes.length ? incomes[incomes.length - 1].date : "—";

  const formatAmount = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
  const formatDate = (dateStr) => dateStr || "-";

  const downloadIncomeReport = () => {
    openPdfReport({
      title: "Income Report",
      records: dateFiltered,
      startDate,
      endDate,
      total: reportTotal,
      formatAmount,
      formatDate,
    });
  };

  return (
    <div style={styles.wrapper}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.subLabel}>Finance</p>
          <h2 style={styles.title}>Income List</h2>
        </div>
        <button style={styles.primaryBtn} onClick={() => navigate('/add-income')}>+ Add Income</button>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        <MetricCard label="Total Income" value={`₹${totalIncome.toLocaleString()}`} />
        <MetricCard label="Transactions" value={incomes.length} />
        <MetricCard label="Latest Entry" value={latestDate} />
      </div>

      {/* Date Range Download */}
      <div style={styles.reportControls}>
        <div style={styles.dateField}>
          <label style={styles.dateLabel} htmlFor="income-start-date">
            Start Date
          </label>
          <input
            id="income-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div style={styles.dateField}>
          <label style={styles.dateLabel} htmlFor="income-end-date">
            End Date
          </label>
          <input
            id="income-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <button
          type="button"
          onClick={downloadIncomeReport}
          disabled={loading || Boolean(error)}
          style={{
            ...styles.downloadBtn,
            ...(loading || error ? styles.disabledBtn : {}),
          }}
        >
          Download PDF
        </button>
      </div>

      {/* Table Card */}
      <div style={styles.tableCard}>

        {/* Search */}
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={styles.emptyState}>Loading...</div>
        ) : error ? (
          <div style={styles.emptyState}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>No records found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Name</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Running Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  runningTotal += Number(item.amount);
                  return (
                    <TableRow
                      key={item.id}
                      item={item}
                      runningTotal={runningTotal}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>{filtered.length} entries</span>
          <span style={styles.footerTotal}>
            Total: ₹{reportTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </div>
  );
}

function TableRow({ item, runningTotal }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      style={{ ...styles.tr, background: hovered ? "#f9fafb" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ ...styles.td, color: "#888", fontSize: "13px" }}>{item.date}</td>
      <td style={{ ...styles.td, fontWeight: "500" }}>{item.name}</td>
      <td style={{ ...styles.td, textAlign: "right", color: "#16a34a", fontWeight: "500" }}>
        ₹{Number(item.amount).toLocaleString()}
      </td>
      <td style={styles.td}>{item.purpose}</td>
      <td style={{ ...styles.td, color: "#888" }}>{item.remarks}</td>
      <td style={{ ...styles.td, textAlign: "right" }}>
        ₹{runningTotal.toLocaleString()}
      </td>
    </tr>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    width: "100%",
  },

  subLabel: {
    fontSize: "13px",
    color: "#888",
    margin: "0 0 4px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "500",
    margin: 0,
    color: "#111",
  },

  primaryBtn: {
    padding: "8px 18px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "24px",
    width: "100%",
  },

  metricCard: {
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    border: "0.5px solid #e5e7eb",
  },

  metricLabel: {
    fontSize: "13px",
    color: "#888",
    margin: "0 0 6px",
  },

  metricValue: {
    fontSize: "22px",
    fontWeight: "500",
    margin: 0,
    color: "#111",
  },

  reportControls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "12px",
    marginBottom: "24px",
    alignItems: "end",
  },

  dateField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  dateLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
  },

  dateInput: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    color: "#111",
    fontSize: "14px",
    outline: "none",
    padding: "10px 12px",
  },

  downloadBtn: {
    background: "#111",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    minHeight: "41px",
    padding: "0 18px",
  },

  disabledBtn: {
    cursor: "not-allowed",
    opacity: 0.55,
  },

  tableCard: {
    width: "100%",
    margin: 0,
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderBottom: "0.5px solid #e5e7eb",
  },

  searchIcon: {
    fontSize: "16px",
    color: "#888",
  },

  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    background: "transparent",
    color: "#111",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    tableLayout: "auto",
  },

  theadRow: {
    background: "#f9fafb",
    borderBottom: "0.5px solid #e5e7eb",
  },

  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontWeight: "500",
    fontSize: "13px",
    color: "#888",
  },

  tr: {
    borderTop: "0.5px solid #f0f0f0",
    transition: "background 0.15s",
  },

  td: {
    padding: "12px 16px",
    color: "#111",
  },

  footer: {
    padding: "12px 16px",
    borderTop: "0.5px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    fontSize: "13px",
    color: "#888",
  },

  footerTotal: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#111",
  },

  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#888",
    fontSize: "14px",
  },
};

export default IncomeList;
