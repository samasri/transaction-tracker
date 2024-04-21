import pMap from "p-map";
import { DateTime } from "luxon";

import { Bank, getBankTx } from "./connectors/plaid";
import { filterTransactions } from "./transaction-filter";

export { Bank, type Transaction } from "./connectors/plaid";

export const getTransactions = async (
  banks: Bank[],
  { startDate, endDate }: { startDate: string; endDate: string },
  filter = true
) => {
  const transactions = await pMap(banks, async (bank) => {
    const transactions = await getBankTx(bank, startDate, endDate);
    return filter ? filterTransactions(transactions, bank) : transactions;
  });
  return transactions
    .reduce((total, tx) => [...total, ...tx], [])
    .sort((t1, t2) => {
      const d1 = DateTime.fromFormat(t1.date, "yyyy-MM-dd");
      const d2 = DateTime.fromFormat(t2.date, "yyyy-MM-dd");
      return d2.diff(d1, "milliseconds").milliseconds;
    });
};
