import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Transaction } from "plaid";

import config from "./utils/config-with-env";
import { getTransactions } from "./utils/get-transactions";
import { getMonthName } from "./utils/dates";
import { accountMap } from "./utils/print-transactions";

const amex = config.get("bankTokens.amex");
const tangerine = config.get("bankTokens.tangerine");
const td = config.get("bankTokens.td");

// Make directory called `data` if it doesn't exist
const dataDir = "./data";
if (!existsSync(dataDir)) mkdirSync(dataDir);

/**
 * Saves transaction history as CSV files for each month and account.
 */
export const saveTransactionHistory = async () => {
  const startDate = "2019-01-11";
  const endDate = new Date().toISOString().split("T")[0]; // Today's date

  const transactions = await getTransactions(
    { amex, tangerine, td },
    { startDate, endDate },
    false
  );
  const transactionsPerMonth = new Map<
    string,
    Pick<Transaction, "date" | "name" | "account_id" | "amount">[]
  >();

  transactions.forEach((transaction) => {
    const { authorized_date, date, name, account_id, amount } = transaction;
    const transactionDate = new Date(authorized_date ?? date); // authorized_date is null for debit transactions

    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const key = `${account_id}/${month}/${year}`;
    if (!transactionsPerMonth.has(key)) transactionsPerMonth.set(key, []);
    transactionsPerMonth.get(key)!.push({
      date: transactionDate.toISOString().split("T")[0],
      name,
      account_id,
      amount,
    });
  });

  transactionsPerMonth.forEach((transactions, key) => {
    const [account_id, month, year] = key.split("/");
    const fileName = `${month} ${getMonthName(Number(month))} ${year}.csv`;

    const csvData = transactions
      .map(({ date, name, amount }) => `${date},${name},${amount}`)
      .join("\n");

    const bankName = accountMap[account_id as keyof typeof accountMap];
    const accountDir = `${dataDir}/${bankName}`;
    if (!existsSync(accountDir)) mkdirSync(accountDir);
    writeFileSync(`${accountDir}/${fileName}`, csvData);
  });
};
