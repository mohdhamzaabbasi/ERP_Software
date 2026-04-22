const formatCurrency = (value) => Number(value || 0).toFixed(2);

const BillList = ({ bills, type }) => (
  <div className="bill-list">
    {bills.map((bill) => (
      <article className="bill-card" key={bill.billNo}>
        <div className="bill-header">
          <strong>{bill.billNo}</strong>
          <span>{new Date(bill.date).toLocaleDateString()}</span>
        </div>
        {type === "sale" && bill.customer?.name && <p>Customer: {bill.customer.name}</p>}
        {type === "purchase" && <p>Stockist: {bill.stockistCode}</p>}
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item) => (
              <tr key={item._id}>
                <td>{item.productNameSnapshot || item.productCode}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.saleRateSnapshot ?? item.purchaseRate)}</td>
                <td>{formatCurrency(item.amount ?? item.netAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bill-total">
          {type === "sale" ? (
            <>
              <span>Total {formatCurrency(bill.totalAmount)}</span>
              <span>Discount {formatCurrency(bill.discount)}</span>
              <strong>Net {formatCurrency(bill.netAmount)}</strong>
            </>
          ) : (
            <strong>Total {formatCurrency(bill.totalAmount)}</strong>
          )}
        </div>
      </article>
    ))}
  </div>
);

export default BillList;
