import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddExpense() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const dateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    purpose: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker?.();
  };

  useEffect(() => {
    // load totals for previewing projected balance
    const loadTotals = async () => {
      try {
        const [incRes, expRes] = await Promise.all([
          API.get("income/list/"),
          API.get("expense/list/"),
        ]);

        const incTotal = (incRes.data || []).reduce(
          (s, it) => s + Number(it.amount || 0),
          0
        );
        const expTotal = (expRes.data || []).reduce(
          (s, it) => s + Number(it.amount || 0),
          0
        );

        setIncomeTotal(incTotal);
        setExpenseTotal(expTotal);
      } catch (err) {
        console.error("Failed to load totals:", err);
      }
    };

    loadTotals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post("expense/add/", formData);
      alert(response?.data?.message || "Expense Added Successfully");
      navigate("/expense-list");
    } catch (error) {
      console.error("Expense save failed:", error?.response?.data || error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error while saving expense";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .ae-wrapper {
          width: 100%;
          padding: 1.5rem 0;
          box-sizing: border-box;
          font-family: inherit;
        }

        .ae-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .ae-sub-label {
          font-size: 13px;
          color: #888;
          margin: 0 0 4px;
        }

        .ae-title {
          font-size: 22px;
          font-weight: 600;
          margin: 0;
          color: #111;
        }

        .ae-back-btn {
          padding: 8px 18px;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111;
          cursor: pointer;
          transition: background 0.15s;
        }

        .ae-back-btn:hover {
          background: #f3f4f6;
        }

        .ae-card {
          background: #fff;
          border: 0.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          box-sizing: border-box;
        }

        .ae-section-title {
          font-size: 12px;
          font-weight: 600;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 16px;
        }

        .ae-divider {
          border: none;
          border-top: 0.5px solid #f0f0f0;
          margin: 24px 0;
        }

        .ae-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .ae-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .ae-field:last-child {
          margin-bottom: 0;
        }

        .ae-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .ae-required {
          color: #ef4444;
          margin-left: 2px;
        }

        .ae-input,
        .ae-textarea {
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
          color: #111;
          background: #f9fafb;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          width: 100%;
        }

        .ae-input::placeholder,
        .ae-textarea::placeholder {
          color: #bbb;
        }

        .ae-input:focus,
        .ae-textarea:focus {
          border-color: #111;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
        }

        .ae-input:hover:not(:focus),
        .ae-textarea:hover:not(:focus) {
          border-color: #d1d5db;
          background: #f3f4f6;
        }

        .ae-textarea {
          resize: vertical;
          min-height: 90px;
        }

        .ae-amount-wrap {
          position: relative;
        }

        .ae-currency {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #888;
          pointer-events: none;
          font-weight: 500;
        }

        .ae-amount-wrap .ae-input {
          padding-left: 28px;
        }

        .ae-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 0.5px solid #e5e7eb;
        }

        .ae-cancel-btn {
          padding: 10px 22px;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #555;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s;
        }

        .ae-cancel-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .ae-submit-btn {
          padding: 10px 28px;
          font-size: 14px;
          border-radius: 8px;
          border: none;
          background: #111;
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          transition: background 0.15s, opacity 0.15s;
        }

        .ae-submit-btn:hover:not(:disabled) {
          background: #333;
        }

        .ae-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="ae-wrapper">

        {/* Header */}
        <div className="ae-header">
          <div>
            <p className="ae-sub-label">Finance</p>
            <h2 className="ae-title">Add Expense</h2>
          </div>
          <button className="ae-back-btn" onClick={() => navigate("/expense-list")}>
            ← Back
          </button>
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '0.5px solid #e5e7eb' }}>
            <div style={{ fontSize: 12, color: '#888' }}>Total Income</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>₹{incomeTotal.toLocaleString()}</div>
          </div>
          <div style={{ padding: 12, background: '#fff7f6', borderRadius: 8, border: '0.5px solid #fde2e2' }}>
            <div style={{ fontSize: 12, color: '#888' }}>Total Expenses</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>₹{expenseTotal.toLocaleString()}</div>
          </div>
          <div style={{ padding: 12, background: '#eef2ff', borderRadius: 8, border: '0.5px solid #e0e7ff', marginLeft: 'auto' }}>
            <div style={{ fontSize: 12, color: '#888' }}>Current Balance</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>₹{(incomeTotal - expenseTotal).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              Projected: ₹{(incomeTotal - expenseTotal - Number(formData.amount || 0)).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="ae-card">
          <form onSubmit={handleSubmit}>

            {/* Basic Info */}
            <p className="ae-section-title">Basic Info</p>
            <div className="ae-row">
              <div className="ae-field">
                <label className="ae-label">
                  Expense Name <span className="ae-required">*</span>
                </label>
                <input
                  className="ae-input"
                  type="text"
                  name="name"
                  placeholder="e.g. Office Supplies"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ae-field">
                <label className="ae-label">
                  Amount <span className="ae-required">*</span>
                </label>
                <div className="ae-amount-wrap">
                  <span className="ae-currency">₹</span>
                  <input
                    className="ae-input"
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="ae-field">
              <label className="ae-label">
                Date <span className="ae-required">*</span>
              </label>
              <input
                ref={dateInputRef}
                className="ae-input"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onClick={openDatePicker}
                onFocus={openDatePicker}
                required
              />
            </div>

            <hr className="ae-divider" />

            {/* Details */}
            <p className="ae-section-title">Details</p>
            <div className="ae-field">
              <label className="ae-label">Purpose</label>
              <textarea
                className="ae-textarea"
                name="purpose"
                placeholder="What is this expense for?"
                value={formData.purpose}
                onChange={handleChange}
              />
            </div>

            <div className="ae-field">
              <label className="ae-label">Remarks</label>
              <textarea
                className="ae-textarea"
                name="remarks"
                placeholder="Any additional notes..."
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            {/* Actions */}
            <div className="ae-actions">
              <button
                type="button"
                className="ae-cancel-btn"
                onClick={() => navigate("/expense-list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ae-submit-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Expense"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default AddExpense;
