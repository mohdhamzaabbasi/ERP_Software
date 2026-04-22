import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { expenseApi } from "../services/domain";

const ExpensesPage = () => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ expenseCode: "", expenseCategory: "" });
  const [expenseForm, setExpenseForm] = useState({ expenseCode: "", date: "", amount: "", note: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    expenseApi.categories().then(setCategories).catch((err) => setError(err.message));
    expenseApi.list().then(setExpenses).catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await expenseApi.createCategory(categoryForm);
      setCategoryForm({ expenseCode: "", expenseCategory: "" });
      setMessage("Expense category created");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addExpense = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await expenseApi.create({ ...expenseForm, amount: Number(expenseForm.amount) });
      setExpenseForm({ expenseCode: "", date: "", amount: "", note: "" });
      setMessage("Expense added");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Expenses</h1>
        <p>Overhead categories and entries</p>
      </div>
      <Message error={error} success={message} />
      <div className="two-column">
        <form className="form-panel" onSubmit={addCategory}>
          <h2>Category</h2>
          <input
            placeholder="Expense code"
            value={categoryForm.expenseCode}
            onChange={(event) => setCategoryForm({ ...categoryForm, expenseCode: event.target.value })}
            required
          />
          <input
            placeholder="Category name"
            value={categoryForm.expenseCategory}
            onChange={(event) => setCategoryForm({ ...categoryForm, expenseCategory: event.target.value })}
            required
          />
          <button>Add Category</button>
        </form>
        <form className="form-panel" onSubmit={addExpense}>
          <h2>Entry</h2>
          <select
            value={expenseForm.expenseCode}
            onChange={(event) => setExpenseForm({ ...expenseForm, expenseCode: event.target.value })}
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.expenseCode} value={category.expenseCode}>
                {category.expenseCategory}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={expenseForm.date}
            onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Amount"
            value={expenseForm.amount}
            onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
            required
          />
          <input
            placeholder="Note"
            value={expenseForm.note}
            onChange={(event) => setExpenseForm({ ...expenseForm, note: event.target.value })}
          />
          <button>Add Expense</button>
        </form>
      </div>
      <DataTable
        rows={expenses}
        columns={[
          { key: "expenseCode", label: "Code" },
          { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
          { key: "amount", label: "Amount", render: (row) => row.amount.toFixed(2) },
          { key: "note", label: "Note" }
        ]}
      />
    </>
  );
};

export default ExpensesPage;
