import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddIncome from "./pages/AddIncome";
import AddExpense from "./pages/AddExpense";
import IncomeList from "./pages/IncomeList";
import ExpenseList from "./pages/ExpenseList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-income" element={<AddIncome />} />
        <Route path="/income-list" element={<IncomeList />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/expense-list" element={<ExpenseList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;