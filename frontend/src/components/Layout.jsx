import { useAuth } from "../context/useAuth";
import { useBranding } from "../context/useBranding";

const navItems = [
  ["dashboard", "Dashboard"],
  ["stockists", "Stockists"],
  ["products", "Products"],
  ["purchase", "Purchase Entry"],
  ["sale", "Sale Entry"],
  ["sale-register", "Sale Register"],
  ["purchase-register", "Purchase Register"],
  ["product-register", "Product Register"],
  ["low-stock", "Low Stock"],
  ["customers", "Customers"],
  ["expenses", "Expenses"]
];

const Layout = ({ currentPage, setCurrentPage, children }) => {
  const { admin, logout } = useAuth();
  const { branding } = useBranding();
  const businessName = admin?.businessName || branding.businessName;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">PS</span>
          <div>
            <strong>{businessName}</strong>
            <small>Admin Console</small>
          </div>
        </div>

        <nav>
          {navItems.map(([id, label]) => (
            <button
              key={id}
              className={currentPage === id ? "nav-button active" : "nav-button"}
              onClick={() => setCurrentPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <strong>{businessName} Management System</strong>
            <span>Signed in as {admin?.username || "admin"}</span>
          </div>
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </header>
        <section className="page">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
