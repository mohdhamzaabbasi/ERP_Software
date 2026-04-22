import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { reportApi } from "../services/domain";

const LowStockPage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    reportApi.lowStock().then(setProducts).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="page-title">
        <h1>Low Stock</h1>
        <p>Items that need reorder attention</p>
      </div>
      <Message error={error} />
      <DataTable
        rows={products}
        columns={[
          { key: "stockistCode", label: "Stockist" },
          { key: "productCode", label: "Code" },
          { key: "productName", label: "Product" },
          { key: "quantity", label: "Available" },
          { key: "minimumQuantity", label: "Minimum" }
        ]}
      />
    </>
  );
};

export default LowStockPage;
