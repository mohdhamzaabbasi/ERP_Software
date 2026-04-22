import { useState } from "react";
import { useAuth } from "./context/useAuth";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StockistsPage from "./pages/StockistsPage";
import ProductsPage from "./pages/ProductsPage";
import PurchaseEntryPage from "./pages/PurchaseEntryPage";
import SaleEntryPage from "./pages/SaleEntryPage";
import RegisterPage from "./pages/RegisterPage";
import ProductRegisterPage from "./pages/ProductRegisterPage";
import LowStockPage from "./pages/LowStockPage";
import CustomersPage from "./pages/CustomersPage";
import ExpensesPage from "./pages/ExpensesPage";

const App = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const pages = {
    dashboard: <DashboardPage />,
    stockists: <StockistsPage />,
    products: <ProductsPage />,
    purchase: <PurchaseEntryPage />,
    sale: <SaleEntryPage />,
    "sale-register": <RegisterPage type="sale" />,
    "purchase-register": <RegisterPage type="purchase" />,
    "product-register": <ProductRegisterPage />,
    "low-stock": <LowStockPage />,
    customers: <CustomersPage />,
    expenses: <ExpensesPage />
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {pages[currentPage]}
    </Layout>
  );
};

export default App;
