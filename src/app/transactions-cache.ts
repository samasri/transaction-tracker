import { calculateExpenses } from "../lib/expenses-calculator";

const isGlobal = (
  obj: any
): obj is typeof globalThis & { txCache: Awaited<ReturnType<typeof calculateExpenses>> | undefined } => {
  if (typeof obj === "object") return true;
  else return false;
};

export const get = async (startDate: string, endDate: string) => {
  /* this should never happen, just making TS happy */
  if (!isGlobal(global)) throw new Error("Unexpected global object");

  if (!global.txCache) global.txCache = await calculateExpenses(startDate, endDate);
  return global.txCache;
};

export const refresh = async (startDate: string, endDate: string) => {
  /* this should never happen, just making TS happy */
  if (!isGlobal(global)) throw new Error("Unexpected global object");

  global.txCache = await calculateExpenses(startDate, endDate);
  await get(startDate, endDate);
  return global.txCache;
};
