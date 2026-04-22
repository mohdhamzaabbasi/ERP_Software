import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { productApi, purchaseApi, stockistApi } from "../services/domain";

const today = () => new Date().toISOString().slice(0, 10);

const PurchaseEntryPage = () => {
  const [stockists, setStockists] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockistCode, setStockistCode] = useState("");
  const [date, setDate] = useState(today());
  const [productCode, setProductCode] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [saleRate, setSaleRate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    stockistApi.list().then(setStockists).catch((err) => setError(err.message));
    productApi.list().then(setProducts).catch((err) => setError(err.message));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.stockistCode === stockistCode),
    [products, stockistCode]
  );

  const addItem = () => {
    setError("");
    const product = products.find((entry) => entry.productCode === productCode);

    if (!stockistCode || !product || Number(quantity) < 1 || Number(purchaseRate) < 0 || Number(saleRate) < 0) {
      setError("Select stockist, product, purchase rate, sale rate, and quantity");
      return;
    }

    const currentBatch = Number(product.batch || 0);
    const nextBatch =
      currentBatch === 0 || Number(product.latestPurchaseRate || 0) === Number(purchaseRate)
        ? Math.max(currentBatch, 1)
        : currentBatch + 1;

    setItems([
      ...items,
      {
        productCode,
        productName: product.productName,
        purchaseRate: Number(purchaseRate),
        saleRate: Number(saleRate),
        batch: nextBatch,
        quantity: Number(quantity),
        netAmount: Number(purchaseRate) * Number(quantity)
      }
    ]);
    setProductCode("");
    setPurchaseRate("");
    setSaleRate("");
    setQuantity("");
  };

  const total = items.reduce((sum, item) => sum + item.netAmount, 0);

  const submit = async () => {
    setError("");
    setMessage("");

    try {
      const bill = await purchaseApi.create({ stockistCode, date, items });
      setMessage(`Purchase saved as ${bill.billNo}`);
      setItems([]);
      setStockistCode("");
      setDate(today());
      productApi.list().then(setProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Purchase Entry</h1>
        <p>Add stock received from suppliers</p>
      </div>
      <Message error={error} success={message} />
      <section className="entry-grid">
        <div className="form-panel">
          <label>
            Date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            Stockist
            <select value={stockistCode} onChange={(event) => setStockistCode(event.target.value)}>
              <option value="">Select stockist</option>
              {stockists.map((stockist) => (
                <option key={stockist.stockistCode} value={stockist.stockistCode}>
                  {stockist.stockistName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product
            <select
              value={productCode}
              onChange={(event) => {
                const selected = products.find((product) => product.productCode === event.target.value);
                setProductCode(event.target.value);
                setPurchaseRate(selected?.latestPurchaseRate || "");
                setSaleRate(selected?.saleRate || "");
              }}
              disabled={!stockistCode}
            >
              <option value="">Select product</option>
              {filteredProducts.map((product) => (
                <option key={product.productCode} value={product.productCode}>
                  {product.productCode} - {product.productName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Purchase Rate
            <input
              type="number"
              min="0"
              value={purchaseRate}
              onChange={(event) => setPurchaseRate(event.target.value)}
            />
          </label>
          <label>
            Sale Rate
            <input
              type="number"
              min="0"
              value={saleRate}
              onChange={(event) => setSaleRate(event.target.value)}
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
          <button onClick={addItem}>Add Item</button>
        </div>
        <div>
          <DataTable
            rows={items}
            columns={[
              { key: "productCode", label: "Code" },
              { key: "productName", label: "Product" },
              { key: "quantity", label: "Qty" },
              { key: "purchaseRate", label: "Rate" },
              { key: "saleRate", label: "Sale Rate" },
              { key: "batch", label: "Batch" },
              { key: "netAmount", label: "Amount", render: (row) => row.netAmount.toFixed(2) }
            ]}
          />
          <div className="bill-total-line">Total: {total.toFixed(2)}</div>
          <button disabled={!items.length} onClick={submit}>
            Save Purchase
          </button>
        </div>
      </section>
    </>
  );
};

export default PurchaseEntryPage;
