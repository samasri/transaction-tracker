import { Transaction } from "plaid";
import Table from "cli-table3";
import chalk from "chalk";
import { getBalance } from "./splitwise-balance";

export const accountMap = {
  'd6099398-3bd2-11ee-be56-0242ac120002': "Amex Credit Catd",
  'de595600-3bd2-11ee-be56-0242ac120002': "Tangerine Credit Card",
  'e430d1ca-3bd2-11ee-be56-0242ac120002': "TD Credit Card",
};

/**
 * Calculates the balance based on a given array of transactions and an optional Splitwise group ID.
 *
 * @param {Transaction[]} transactions - An array of transactions.
 * @param {string} [splitWiseGroupId] - Optional Splitwise group ID.
 * @returns {Promise<{ balance: number, txTotal: number }>} An object containing the calculated balance and the total transaction amount.
 */
export const calculateBalance = async (
  transactions: Transaction[],
  splitWiseGroupId?: string
): Promise<{ balance: number; txTotal: number }> => {
  const txTotal = transactions.reduce(
    (total, tx) => total + Number(tx.amount),
    0
  );
  const splitWiseDebt = splitWiseGroupId
    ? await getBalance(splitWiseGroupId)
    : 0;
  return { balance: txTotal - splitWiseDebt, txTotal };
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
  txTotal: number,
  balance: number,
  verbose: boolean
) => {
  const table = new Table({
    head: ["Date", "Name", "Amount", "Account"].concat(
      verbose ? ["Transaction ID"] : []
    ),
    style: { compact: true },
  });

  const hashedTransactions = transactions.reduce(
    (hashedTransactions, transaction) => {
      const { name } = transaction;
      if (!(name in hashedTransactions)) hashedTransactions[name] = [];
      hashedTransactions[name].push(transaction);
      return hashedTransactions;
    },
    {} as { [index: string]: Transaction[] }
  );

  for (const transactionName in hashedTransactions) {
    const transactions = hashedTransactions[transactionName];
    const { account_id, transaction_id } = transactions[0];
    const id = account_id as unknown as keyof typeof accountMap;
    const date = chalk.yellow(transactions[0].date);
    const name = chalk.white(transactionName);
    const amount = transactions
      .reduce((total, current) => current.amount + total, 0)
      .toFixed(2);
    const amountStr = chalk.green(`${amount}$`);
    const account = chalk.grey(accountMap[id]);
    table.push(
      [date, name, amountStr, account].concat(verbose ? [transaction_id] : [])
    );
  }

  table.push(["sub-total", txTotal.toFixed(2)]);
  table.push(["total", balance.toFixed(2)]);
  console.log(table.toString());
};
