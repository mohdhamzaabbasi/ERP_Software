import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { customerApi } from "../services/domain";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    customerApi.list().then(setCustomers).catch((err) => setError(err.message));
  }, []);

  const loadHistory = async (customer) => {
    try {
      setSelected(await customerApi.history(customer.customerId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Customers</h1>
        <p>Customer records created from sales</p>
      </div>
      <Message error={error} />
      <DataTable
        rows={customers}
        columns={[
          { key: "customerId", label: "Customer ID" },
          { key: "name", label: "Name" },
          { key: "phoneNo", label: "Phone" },
          { key: "emailId", label: "Email" },
          {
            key: "history",
            label: "History",
            render: (row) => (
              <button className="secondary-button" onClick={() => loadHistory(row)}>
                View
              </button>
            )
          }
        ]}
      />
      {selected && (
        <section className="history-panel">
          <h2>{selected.customer.name}</h2>
          <DataTable
            rows={selected.sales}
            columns={[
              { key: "billNo", label: "Bill No" },
              { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
              { key: "netAmount", label: "Net", render: (row) => row.netAmount.toFixed(2) }
            ]}
          />
        </section>
      )}
    </>
  );
};

export default CustomersPage;
