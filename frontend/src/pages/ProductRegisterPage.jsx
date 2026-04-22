import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { reportApi, stockistApi } from "../services/domain";

const ProductRegisterPage = () => {
  const [stockists, setStockists] = useState([]);
  const [stockistCode, setStockistCode] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    stockistApi.list().then(setStockists).catch((err) => setError(err.message));
  }, []);

  const load = async (code) => {
    setStockistCode(code);
    if (!code) {
      setProducts([]);
      return;
    }
    try {
      setProducts(await reportApi.productRegister(code));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Product Register</h1>
        <p>Inventory by stockist</p>
      </div>
      <Message error={error} />
      <div className="filter-bar">
        <select value={stockistCode} onChange={(event) => load(event.target.value)}>
          <option value="">Select stockist</option>
          {stockists.map((stockist) => (
            <option key={stockist.stockistCode} value={stockist.stockistCode}>
              {stockist.stockistName}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        rows={products}
        columns={[
          { key: "productCode", label: "Code" },
          { key: "productName", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "minimumQuantity", label: "Min Qty" },
          { key: "saleRate", label: "Sale Rate" }
        ]}
      />
    </>
  );
};

export default ProductRegisterPage;
