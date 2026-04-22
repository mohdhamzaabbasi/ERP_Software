const DataTable = ({ columns, rows, emptyText = "No records found" }) => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="empty-cell">
              {emptyText}
            </td>
          </tr>
        )}
        {rows.map((row, index) => (
          <tr key={row._id || row.billNo || row.productCode || row.customerId || index}>
            {columns.map((column) => (
              <td key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
