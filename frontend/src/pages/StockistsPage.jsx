import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { stockistApi } from "../services/domain";

const emptyForm = { stockistCode: "", stockistName: "", phone: "", address: "" };

const StockistsPage = () => {
  const [stockists, setStockists] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCode, setEditingCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => stockistApi.list().then(setStockists).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingCode) {
        await stockistApi.update(editingCode, form);
        setMessage("Stockist updated");
      } else {
        await stockistApi.create(form);
        setMessage("Stockist created");
      }
      setForm(emptyForm);
      setEditingCode("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (stockist) => {
    setEditingCode(stockist.stockistCode);
    setForm({
      stockistCode: stockist.stockistCode,
      stockistName: stockist.stockistName,
      phone: stockist.phone || "",
      address: stockist.address || ""
    });
  };

  const remove = async (stockist) => {
    if (!window.confirm(`Delete ${stockist.stockistName}?`)) return;
    try {
      await stockistApi.remove(stockist.stockistCode);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Stockists</h1>
        <p>Manage suppliers and stockist records</p>
      </div>
      <Message error={error} success={message} />
      <form className="form-grid" onSubmit={submit}>
        <input
          placeholder="Stockist code"
          value={form.stockistCode}
          onChange={(event) => setForm({ ...form, stockistCode: event.target.value })}
          disabled={Boolean(editingCode)}
          required
        />
        <input
          placeholder="Stockist name"
          value={form.stockistName}
          onChange={(event) => setForm({ ...form, stockistName: event.target.value })}
          required
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
        />
        <button>{editingCode ? "Update Stockist" : "Add Stockist"}</button>
        {editingCode && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setEditingCode("");
              setForm(emptyForm);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <DataTable
        rows={stockists}
        columns={[
          { key: "stockistCode", label: "Code" },
          { key: "stockistName", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="row-actions">
                <button className="secondary-button" onClick={() => edit(row)}>
                  Edit
                </button>
                <button className="danger-button" onClick={() => remove(row)}>
                  Delete
                </button>
              </div>
            )
          }
        ]}
      />
    </>
  );
};

export default StockistsPage;
