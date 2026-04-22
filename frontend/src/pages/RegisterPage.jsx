import { useState } from "react";
import BillList from "../components/BillList";
import Message from "../components/Message";
import { reportApi } from "../services/domain";

const months = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"]
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 8 }, (_, index) => String(currentYear - index));

const RegisterPage = ({ type }) => {
  const [mode, setMode] = useState("today");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(currentYear));
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");

  const title = type === "sale" ? "Sale Register" : "Purchase Register";

  const load = async () => {
    setError("");
    try {
      let data;
      if (type === "sale") {
        if (mode === "today") data = await reportApi.salesToday();
        if (mode === "date") data = await reportApi.salesByDate(date);
        if (mode === "month") data = await reportApi.salesByMonth(month, year);
      } else {
        if (mode === "today") data = await reportApi.purchasesToday();
        if (mode === "date") data = await reportApi.purchasesByDate(date);
        if (mode === "month") data = await reportApi.purchasesByMonth(month, year);
      }
      setBills(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>{title}</h1>
        <p>Bill-wise report with line items</p>
      </div>
      <Message error={error} />
      <div className="filter-bar">
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="today">Today</option>
          <option value="date">By Date</option>
          <option value="month">By Month</option>
        </select>
        {mode === "date" && <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />}
        {mode === "month" && (
          <>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {months.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </>
        )}
        <button onClick={load}>Load Register</button>
      </div>
      <BillList bills={bills} type={type} />
    </>
  );
};

export default RegisterPage;
