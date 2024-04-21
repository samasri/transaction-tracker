import { accountMap } from "../lib/account-map";
import { sw } from "../lib/transaction-database";
import { Transaction } from "./interface";
import * as spendings from "./transactions-cache";

const addSplitwiseInfo = (transactions: Transaction[]) =>
  transactions.map((tx) => ({
    ...tx,
    isSplit: sw.get(tx.id) ?? (tx.pendingId ? sw.get(tx.pendingId) : undefined) ?? false,
  }));

export const spendingsRows = async (startDate: string, endDate: string) => {
  const { transactions, summary } = await spendings.get(startDate, endDate);
  const rows = transactions.map((tx) => {
    const id = tx.account_id as unknown as keyof typeof accountMap;
    const account = accountMap[id];
    return {
      id: tx.transaction_id,
      pendingId: tx.pending_transaction_id,
      Date: tx.date,
      isPending: tx.pending,
      Name: tx.name,
      Amount: String(tx.amount),
      Account: account,
    };
  });
  rows.push({
    id: "0",
    Date: "",
    isPending: false,
    Name: "Sub-total",
    Amount: summary.txTotal.toFixed(2),
    Account: "",
    pendingId: "",
  });
  rows.push({
    id: "1",
    Date: "",
    isPending: false,
    Name: "Total",
    Amount: summary.balance.toFixed(2),
    Account: "",
    pendingId: "",
  });
  return addSplitwiseInfo(rows);
};
