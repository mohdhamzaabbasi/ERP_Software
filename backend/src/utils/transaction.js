const mongoose = require("mongoose");

const runWithOptionalTransaction = async (work) => {
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (
      error.message &&
      (error.message.includes("Transaction numbers are only allowed") ||
        error.message.includes("replica set member or mongos"))
    ) {
      return work(null);
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = runWithOptionalTransaction;
