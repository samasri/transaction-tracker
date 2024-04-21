import { Transaction } from "plaid";

import { Bank, getTransactions } from "./transaction-retriever";
import { getOwedTotal as getDebt } from "./connectors/splitwise";

const calculateBalance = async (transactions: Transaction[]) => {
  const txTotal = transactions.reduce((total, tx) => total + Number(tx.amount), 0);
  const splitWiseDebt = await getDebt();
  return { balance: txTotal - splitWiseDebt, txTotal };
};

export const calculateExpenses = async (startDate: string, endDate: string) => {
  const transactions = (await getTransactions([Bank.amex, Bank.tangerine, Bank.td], { startDate, endDate })).filter(
    (transaction: Transaction) => new Date(transaction.authorized_date ?? startDate) >= new Date(startDate)
  );

  const summary = await calculateBalance(transactions);

  return { transactions, summary };
};
