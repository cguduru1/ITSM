// backend/services/financialService.js
import FinancialLifecycle from "../models/FinancialLifecycle.js";

export async function createFinancial(doc, session = null) {
  if (session) return (await FinancialLifecycle.create([doc], { session }))[0];
  return await FinancialLifecycle.create(doc);
}

export async function updateBookValue(financialId, value) {
  return await FinancialLifecycle.findOneAndUpdate({ financialId }, { currentBookValue: value }, { new: true });
}
