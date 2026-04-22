const formatDatePart = (dateValue) => {
  const date = new Date(dateValue);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const generateBillNumber = async (model, prefix, dateValue, session) => {
  const datePart = formatDatePart(dateValue);
  const pattern = `^${prefix}-${datePart}-`;

  const query = model.findOne({ billNo: { $regex: pattern } }).sort({ billNo: -1 });

  if (session) {
    query.session(session);
  }

  const lastBill = await query;
  const lastSequence = lastBill ? Number(lastBill.billNo.split("-").pop()) : 0;
  const nextSequence = String(lastSequence + 1).padStart(4, "0");

  return `${prefix}-${datePart}-${nextSequence}`;
};

module.exports = generateBillNumber;
