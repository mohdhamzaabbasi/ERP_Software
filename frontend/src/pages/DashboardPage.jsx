import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import Message from "../components/Message";
import { dashboardApi } from "../services/domain";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.summary().then(setSummary).catch((err) => setError(err.message));
  }, []);

  if (error) return <Message error={error} />;
  if (!summary) return <div className="loading">Loading dashboard...</div>;

  return (
    <>
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>Today’s shop snapshot</p>
      </div>
      <div className="stats-grid">
        <StatCard label="Today Sales" value={summary.todaySales.toFixed(2)} />
        <StatCard label="Today Purchases" value={summary.todayPurchases.toFixed(2)} />
        <StatCard label="Total Products" value={summary.totalProducts} />
        <StatCard label="Low Stock Items" value={summary.lowStockProductCount} />
      </div>
      <div className="two-column">
        <section>
          <h2>Recent Sales</h2>
          <DataTable
            rows={summary.recentSales}
            columns={[
              { key: "billNo", label: "Bill No" },
              { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
              { key: "netAmount", label: "Net", render: (row) => row.netAmount.toFixed(2) }
            ]}
          />
        </section>
        <section>
          <h2>Recent Purchases</h2>
          <DataTable
            rows={summary.recentPurchases}
            columns={[
              { key: "billNo", label: "Bill No" },
              { key: "stockistCode", label: "Stockist" },
              { key: "totalAmount", label: "Total", render: (row) => row.totalAmount.toFixed(2) }
            ]}
          />
        </section>
      </div>
    </>
  );
};

export default DashboardPage;
