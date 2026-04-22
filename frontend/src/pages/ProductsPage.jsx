import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { productApi, stockistApi } from "../services/domain";

const emptyForm = {
  productCode: "",
  stockistCode: "",
  productName: "",
  minimumQuantity: ""
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [stockists, setStockists] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCode, setEditingCode] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => productApi.list().then(setProducts).catch((err) => setError(err.message));

  useEffect(() => {
    load();
    stockistApi.list().then(setStockists).catch((err) => setError(err.message));
  }, []);

  const filteredProducts = useMemo(() => {
    const needle = query.toLowerCase();
    return products.filter(
      (product) =>
        product.productCode.toLowerCase().includes(needle) ||
        product.productName.toLowerCase().includes(needle) ||
        product.stockistCode.toLowerCase().includes(needle)
    );
  }, [products, query]);

  const payload = () => ({
    ...form,
    minimumQuantity: Number(form.minimumQuantity || 0)
  });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingCode) {
        await productApi.update(editingCode, payload());
        setMessage("Product updated");
      } else {
        await productApi.create(payload());
        setMessage("Product created");
      }
      setForm(emptyForm);
      setEditingCode("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (product) => {
    setEditingCode(product.productCode);
    setForm({
      productCode: product.productCode,
      stockistCode: product.stockistCode,
      productName: product.productName,
      minimumQuantity: product.minimumQuantity
    });
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.productName}?`)) return;
    try {
      await productApi.remove(product.productCode);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Products</h1>
        <p>Add product basics. Rates, quantity, and batches are managed through purchase entry.</p>
      </div>
      <Message error={error} success={message} />
      <form className="form-grid product-form" onSubmit={submit}>
        <input
          placeholder="Product code"
          value={form.productCode}
          onChange={(event) => setForm({ ...form, productCode: event.target.value })}
          disabled={Boolean(editingCode)}
          required
        />
        <select
          value={form.stockistCode}
          onChange={(event) => setForm({ ...form, stockistCode: event.target.value })}
          required
        >
          <option value="">Select stockist</option>
          {stockists.map((stockist) => (
            <option key={stockist.stockistCode} value={stockist.stockistCode}>
              {stockist.stockistName}
            </option>
          ))}
        </select>
        <input
          placeholder="Product name"
          value={form.productName}
          onChange={(event) => setForm({ ...form, productName: event.target.value })}
          required
        />
        <input
          type="number"
          min="0"
          placeholder="Minimum quantity"
          value={form.minimumQuantity}
          onChange={(event) => setForm({ ...form, minimumQuantity: event.target.value })}
          required
        />
        <button>{editingCode ? "Update Product" : "Add Product"}</button>
      </form>
      <input
        className="search-input"
        placeholder="Search products"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <DataTable
        rows={filteredProducts}
        columns={[
          { key: "productCode", label: "Code" },
          { key: "productName", label: "Product" },
          { key: "stockistCode", label: "Stockist" },
          { key: "quantity", label: "Qty" },
          { key: "minimumQuantity", label: "Min" },
          { key: "latestPurchaseRate", label: "Purchase Rate" },
          { key: "saleRate", label: "Sale Rate" },
          { key: "batch", label: "Batch" },
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

export default ProductsPage;
