import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { customerApi, productApi, saleApi, stockistApi } from "../services/domain";

const today = () => new Date().toISOString().slice(0, 10);
const defaultCustomer = {
  customerName: "Default",
  phoneNo: "0123456789",
  emailId: "unknown@mail.com"
};
const phonePattern = /^\d{10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const calculateFifoAmount = (product, quantity) => {
  const batches = product.batches?.length
    ? product.batches
    : [{ quantity: product.quantity, saleRate: product.saleRate }];
  let remainingQuantity = quantity;
  let amount = 0;

  for (const batch of batches) {
    if (remainingQuantity === 0) break;
    const allocatedQuantity = Math.min(Number(batch.quantity), remainingQuantity);
    amount += allocatedQuantity * Number(batch.saleRate || 0);
    remainingQuantity -= allocatedQuantity;
  }

  return amount;
};

const SaleEntryPage = () => {
  const [stockists, setStockists] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState(defaultCustomer);
  const [date, setDate] = useState(today());
  const [stockistCode, setStockistCode] = useState("");
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("");
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

  const lookupCustomer = async () => {
    if (!phonePattern.test(customer.phoneNo)) return;
    try {
      const data = await customerApi.lookup(customer.phoneNo);
      if (data.exists) {
        setCustomer({
          customerName: data.customer.name,
          phoneNo: data.customer.phoneNo,
          emailId: data.customer.emailId || ""
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addItem = () => {
    setError("");
    const product = products.find((entry) => entry.productCode === productCode);
    const qty = Number(quantity);

    if (!product || qty < 1) {
      setError("Select product and quantity");
      return;
    }

    const existingItem = items.find((item) => item.productCode === productCode);
    const updatedQuantity = (existingItem?.quantity || 0) + qty;

    if (updatedQuantity > product.quantity) {
      setError(`Only ${product.quantity} in stock for ${product.productName}`);
      return;
    }

    const updatedAmount = calculateFifoAmount(product, updatedQuantity);
    const nextItem = {
      productCode,
      productName: product.productName,
      saleRate: updatedQuantity > 0 ? updatedAmount / updatedQuantity : 0,
      quantity: updatedQuantity,
      amount: updatedAmount
    };

    setItems(
      existingItem
        ? items.map((item) => (item.productCode === productCode ? nextItem : item))
        : [...items, nextItem]
    );
    setProductCode("");
    setQuantity("");
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const net = total - Number(discount || 0);

  const submit = async () => {
    setError("");
    setMessage("");

    if (!phonePattern.test(customer.phoneNo)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (!customer.customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    if (customer.emailId && !emailPattern.test(customer.emailId)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      const bill = await saleApi.create({
        ...customer,
        date,
        discount: Number(discount || 0),
        items: items.map((item) => ({ productCode: item.productCode, quantity: item.quantity }))
      });
      setMessage(`Sale saved as ${bill.billNo}`);
      setItems([]);
      setCustomer(defaultCustomer);
      setDate(today());
      setDiscount("");
      productApi.list().then(setProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Sale Entry</h1>
        <p>Create bills and reduce inventory</p>
      </div>
      <Message error={error} success={message} />
      <section className="entry-grid">
        <div className="form-panel">
          <label>
            Date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            Phone
            <input
              value={customer.phoneNo}
              onBlur={lookupCustomer}
              onChange={(event) =>
                setCustomer({
                  ...customer,
                  phoneNo: event.target.value.replace(/\D/g, "").slice(0, 10)
                })
              }
              inputMode="numeric"
              pattern="\d{10}"
              maxLength="10"
              required
            />
          </label>
          <label>
            Customer Name
            <input
              value={customer.customerName}
              onChange={(event) => setCustomer({ ...customer, customerName: event.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={customer.emailId}
              onChange={(event) => setCustomer({ ...customer, emailId: event.target.value })}
              required
            />
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
            <select value={productCode} onChange={(event) => setProductCode(event.target.value)}>
              <option value="">Select product</option>
              {filteredProducts.map((product) => (
                <option key={product.productCode} value={product.productCode}>
                  {product.productCode} - {product.productName} ({product.quantity})
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
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
              { key: "saleRate", label: "Rate" },
              { key: "amount", label: "Amount", render: (row) => row.amount.toFixed(2) }
            ]}
          />
          <label className="discount-field">
            Discount
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </label>
          <div className="bill-total-line">
            Total: {total.toFixed(2)} | Net: {net.toFixed(2)}
          </div>
          <button
            disabled={
              !items.length ||
              !customer.customerName ||
              !phonePattern.test(customer.phoneNo) ||
              !emailPattern.test(customer.emailId)
            }
            onClick={submit}
          >
            Save Sale
          </button>
        </div>
      </section>
    </>
  );
};

export default SaleEntryPage;
