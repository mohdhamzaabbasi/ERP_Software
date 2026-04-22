import { apiRequest } from "./api";

export const authApi = {
  branding: () => apiRequest("/auth/branding"),
  login: (body) => apiRequest("/auth/login", { method: "POST", body })
};

export const dashboardApi = {
  summary: () => apiRequest("/dashboard/summary")
};

export const stockistApi = {
  list: () => apiRequest("/stockists"),
  create: (body) => apiRequest("/stockists", { method: "POST", body }),
  update: (code, body) => apiRequest(`/stockists/${code}`, { method: "PUT", body }),
  remove: (code) => apiRequest(`/stockists/${code}`, { method: "DELETE" })
};

export const productApi = {
  list: (params = "") => apiRequest(`/products${params}`),
  create: (body) => apiRequest("/products", { method: "POST", body }),
  update: (code, body) => apiRequest(`/products/${code}`, { method: "PUT", body }),
  remove: (code) => apiRequest(`/products/${code}`, { method: "DELETE" })
};

export const purchaseApi = {
  list: () => apiRequest("/purchases"),
  create: (body) => apiRequest("/purchases", { method: "POST", body })
};

export const saleApi = {
  list: () => apiRequest("/sales"),
  create: (body) => apiRequest("/sales", { method: "POST", body })
};

export const customerApi = {
  list: () => apiRequest("/customers"),
  lookup: (phone) => apiRequest(`/customers/lookup?phone=${encodeURIComponent(phone)}`),
  history: (customerId) => apiRequest(`/customers/${customerId}/history`)
};

export const reportApi = {
  salesToday: () => apiRequest("/reports/sales/today"),
  salesByDate: (date) => apiRequest(`/reports/sales/by-date?date=${date}`),
  salesByMonth: (month, year) => apiRequest(`/reports/sales/by-month?month=${month}&year=${year}`),
  purchasesToday: () => apiRequest("/reports/purchases/today"),
  purchasesByDate: (date) => apiRequest(`/reports/purchases/by-date?date=${date}`),
  purchasesByMonth: (month, year) =>
    apiRequest(`/reports/purchases/by-month?month=${month}&year=${year}`),
  productRegister: (stockistCode) => apiRequest(`/reports/products?stockistCode=${stockistCode}`),
  lowStock: () => apiRequest("/reports/low-stock")
};

export const expenseApi = {
  categories: () => apiRequest("/expenses/categories"),
  createCategory: (body) => apiRequest("/expenses/categories", { method: "POST", body }),
  list: () => apiRequest("/expenses"),
  create: (body) => apiRequest("/expenses", { method: "POST", body })
};
