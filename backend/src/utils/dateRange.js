const getDayRange = (dateValue = new Date()) => {
  const start = new Date(dateValue);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getMonthRange = (month, year) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (!monthNumber || !yearNumber || monthNumber < 1 || monthNumber > 12) {
    const error = new Error("Valid month and year are required");
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(yearNumber, monthNumber - 1, 1);
  const end = new Date(yearNumber, monthNumber, 1);
  return { start, end };
};

module.exports = { getDayRange, getMonthRange };
