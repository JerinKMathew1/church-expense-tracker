import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function formatAmount(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [totalsError, setTotalsError] = useState("");
  const currentBalance = totalIncome - totalExpense;

  useEffect(() => {
    const loadTotals = async () => {
      setTotalsLoading(true);
      setTotalsError("");

      try {
        const [incomeResponse, expenseResponse] = await Promise.all([
          API.get("income/list/"),
          API.get("expense/list/"),
        ]);

        const incomeData = Array.isArray(incomeResponse.data)
          ? incomeResponse.data
          : [];
        const expenseData = Array.isArray(expenseResponse.data)
          ? expenseResponse.data
          : [];

        setTotalIncome(
          incomeData.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        );
        setTotalExpense(
          expenseData.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        );
      } catch (error) {
        console.error("Failed to load dashboard totals:", error);
        setTotalsError("Unable to load totals");
      } finally {
        setTotalsLoading(false);
      }
    };

    loadTotals();
  }, []);

  return (
    <>
      <style>{`
        .db-wrapper {
          width: 100%;
          padding: 24px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .db-header {
          display: block;
          margin-bottom: 32px;
          width: 100%;
        }

        .db-sub-label {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .db-title {
          display: block;
          font-size: 36px;
          font-weight: 700;
          line-height: 1.2;
          color: #ffffff;
          margin: 0;
          visibility: visible;
          opacity: 1;
        }

        .db-section-label {
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 12px;
        }

        .db-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 2rem;
        }

        .db-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 2rem;
        }

        .db-summary-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          box-sizing: border-box;
        }

        .db-summary-card.green {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }

        .db-summary-card.red {
          border-color: #fecaca;
          background: #fff5f5;
        }

        .db-summary-card.blue {
          border-color: #bfdbfe;
          background: #eff6ff;
        }

        .db-summary-label {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 8px;
          font-weight: 500;
        }

        .db-summary-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1.1;
        }

        .db-summary-note {
          font-size: 12px;
          color: #9ca3af;
          margin: 8px 0 0;
        }

        .db-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
        }

        .db-card:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }

        .db-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .db-card-icon.green {
          background: #dcfce7;
        }

        .db-card-icon.red {
          background: #fee2e2;
        }

        .db-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .db-card-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .db-card-arrow {
          font-size: 18px;
          color: #9ca3af;
          margin-top: auto;
          align-self: flex-end;
        }

        .db-quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 32px;
        }

        .db-action-btn {
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .db-action-btn.primary {
          background: #111827;
          color: white;
          border: none;
        }

        .db-action-btn.secondary {
          background: white;
          color: #111827;
          border: 1px solid #e5e7eb;
        }

        .db-footer {
          border-top: 1px solid rgba(229, 231, 235, 0.35);
          color: #9ca3af;
          font-size: 12px;
          margin-top: 24px;
          padding-top: 16px;
          text-align: center;
        }

        @media (max-width: 700px) {
          .db-grid,
          .db-summary-grid,
          .db-quick-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="db-wrapper">

        {/* Header */}
        <div className="db-header">
          <p className="db-sub-label">Overview</p>

          <h1 className="db-title">
            Church of God Kadampanad Expense Tracker
          </h1>
        </div>

        {/* Totals */}
        <p className="db-section-label">Totals</p>
        <div className="db-summary-grid">
          <div className="db-summary-card green">
            <p className="db-summary-label">Total Amount</p>
            <p className="db-summary-value">
              {totalsLoading ? "Loading..." : formatAmount(totalIncome)}
            </p>
            {totalsError && <p className="db-summary-note">{totalsError}</p>}
          </div>

          <div className="db-summary-card red">
            <p className="db-summary-label">Total Expense</p>
            <p className="db-summary-value">
              {totalsLoading ? "Loading..." : formatAmount(totalExpense)}
            </p>
            {totalsError && <p className="db-summary-note">{totalsError}</p>}
          </div>

          <div className="db-summary-card blue">
            <p className="db-summary-label">Current Balance</p>
            <p className="db-summary-value">
              {totalsLoading ? "Loading..." : formatAmount(currentBalance)}
            </p>
            {totalsError && <p className="db-summary-note">{totalsError}</p>}
          </div>
        </div>

        {/* View Cards */}
        <p className="db-section-label">Records</p>
        <div className="db-grid">

          <div className="db-card" onClick={() => navigate("/income-list")}>
            <div className="db-card-icon green">💰</div>
            <p className="db-card-title">Income</p>
            <p className="db-card-desc">View all income entries</p>
            <span className="db-card-arrow">→</span>
          </div>

          <div className="db-card" onClick={() => navigate("/expense-list")}>
            <div className="db-card-icon red">📋</div>
            <p className="db-card-title">Expenses</p>
            <p className="db-card-desc">View all expense entries</p>
            <span className="db-card-arrow">→</span>
          </div>

        </div>

        {/* Quick Add */}
        <p className="db-section-label">Quick Add</p>
        <div className="db-quick-actions">
          <button
            className="db-action-btn primary"
            onClick={() => navigate("/add-income")}
          >
            <span>＋</span> Add Income
          </button>
          <button
            className="db-action-btn secondary"
            onClick={() => navigate("/add-expense")}
          >
            <span>＋</span> Add Expense
          </button>
        </div>

        <footer className="db-footer">
          Developed by COG Kadampanad Technical wing
        </footer>

      </div>
    </>
  );
}

export default Dashboard;
