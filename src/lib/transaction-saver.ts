import assert from "assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { DateTime } from "luxon";

import { accountMap } from "./account-map";
import { Bank, getTransactions, Transaction } from "./transaction-retriever";
import { getMonthName } from "./utils/dates";

type TransactionEssence = Pick<Transaction, "date" | "name" | "account_id" | "amount">;

// Make directory called `data` if it doesn't exist
const dataDir = "./data";
if (!existsSync(dataDir)) mkdirSync(dataDir);

const appendUnique = (existingList: string[], newList: string[]) => {
  const uniqueNewItems = newList.filter((item) => !existingList.includes(item));
  return [...uniqueNewItems, ...existingList];
};

const saveTransactionsForMonth = (transactions: TransactionEssence[], key: string) => {
  const [account_id, month, year] = key.split("/");
  const fileName = `${month} ${getMonthName(Number(month))} ${year}.csv`;

  const bankName = accountMap[account_id as keyof typeof accountMap];
  const accountDir = `${dataDir}/${bankName}`;
  const filePath = `${accountDir}/${fileName}`;

  let csvData = transactions.map(({ date, name, amount }) => `${date},${name},${amount}`);
  if (!existsSync(accountDir)) mkdirSync(accountDir);
  if (existsSync(filePath)) {
    const existingMonthData = readFileSync(filePath, "utf-8").split("\n");
    csvData = appendUnique(existingMonthData, csvData);
  }
  writeFileSync(filePath, csvData.join("\n"));
};

/**
 * Saves transaction history as CSV files for each month and account.
 */
export const saveTransactionHistory = async () => {
  const startDate = DateTime.now().minus({ months: 2 }).startOf("month").toFormat("yyyy-MM-dd");
  const endDate = DateTime.now().toFormat("yyyy-MM-dd");
  console.log("Saving transactions:", startDate, "-->", endDate);

  const transactions = await getTransactions([Bank.amex, Bank.tangerine, Bank.td], { startDate, endDate }, false);
  const transactionsPerMonth = new Map<string, TransactionEssence[]>();

  transactions.forEach((transaction) => {
    const { date, name, account_id, amount } = transaction;
    const transactionDate = DateTime.fromISO(date);

    const { month, year } = transactionDate.toObject();
    assert(!!month && !!year, "Could not parse date");

    const key = `${account_id}/${month}/${year}`;
    if (!transactionsPerMonth.has(key)) transactionsPerMonth.set(key, []);
    transactionsPerMonth.get(key)!.push({
      date: transactionDate.toFormat("yyyy-MM-dd"),
      name,
      account_id,
      amount,
    });
  });

  transactionsPerMonth.forEach(saveTransactionsForMonth);
};
