import Table from "cli-table3";
import chalk from "chalk";
import groupBy from "lodash/groupBy";

import { accountMap } from "./account-map";

interface Summary {
  txTotal: number;
  balance: number;
}

interface Transaction {
  name: string;
  account_id: string;
  transaction_id: string;
  date: string;
  amount: number;
}

const createTable = (
  headers: string[],
  transactions: Transaction[],
  summary: Summary,
  verbose: boolean,
  condensed: boolean
) => {
  const table = new Table({
    head: headers,
    style: { compact: true },
  });
  const hashedTransactions = groupBy(transactions, condensed ? "name" : "transaction_id");

  for (const transactionName in hashedTransactions) {
    const transactions = hashedTransactions[transactionName];
    const { account_id, transaction_id } = transactions[0];
    const id = account_id as unknown as keyof typeof accountMap;
    const date = chalk.yellow(transactions[0].date);
    const name = chalk.white(transactions[0].name);
    const amount = transactions.reduce((total, current) => current.amount + total, 0).toFixed(2);
    const amountStr = chalk.green(`${amount}$`);
    const account = chalk.grey(accountMap[id]);
    table.push([date, name, amountStr, account].concat(verbose ? [transaction_id] : []));
  }
  table.push(["Sub-total", summary.txTotal.toFixed(2)]);
  table.push(["Total", summary.balance.toFixed(2)]);
  return table;
};

/**
 * Prints a summary of transactions, grouped by name, in a table format.
 * Calculates and displays the total amount of transactions.
 * @param {Transaction[]} transactions - An array of transactions.
 * @param {number} txTotal - The total spendings in the transactions.
 * @param {number} balance - The balance after the subtracting any money owed to others.
 * @param {boolean} verbose - If true, prints more information about the transaction.
 */
export const printTransactions = async (
  transactions: Transaction[],
  summary: Summary,
  dates: { startDate: string; endDate: string },
  config?: { verbose?: boolean; condensed?: boolean }
) => {
  const verbose = config?.verbose ?? false;
  const condensed = config?.condensed ?? true;

  const headers = ["Date", "Name", "Amount", "Account"].concat(verbose ? ["Transaction ID"] : []);

  const table = createTable(headers, transactions, summary, verbose, condensed);

  console.log(`Displaying spendings: ${dates.startDate} --> ${dates.endDate}`);
  console.log(table.toString());
};
