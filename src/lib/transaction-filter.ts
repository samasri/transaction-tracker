import assert from "assert";
import readline from "readline";

import { Bank, getBankTx, Transaction } from "./connectors/plaid";
export { Bank } from "./connectors/plaid";
import { getCycleDates } from "./date-cycle-detector";
import { ignoredTransactions as txDb, names as namesDb } from "./transaction-database";
import { stdin, stdout } from "node:process";

const firstCycleStart = "January 6, 2023";

const askUser = (prompt: string) => {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  const answerPromise = new Promise<string>((resolve) => {
    rl.question(`${prompt}\n`, (line: string) => {
      resolve(line);
      rl.close();
    });
  });
  return answerPromise;
};

export const resetIgnored = async (bank = Bank.td) => {
  const { startDate, endDate } = getCycleDates(new Date(firstCycleStart));
  console.log(`Fetching e-transfers ${startDate} --> ${endDate}`);
  const transactions = (await getBankTx(bank, startDate, endDate)).filter(
    (transaction) =>
      transaction.name.includes("E-TRANSFER") ||
      transaction.name.includes("SEND E-TFR") ||
      transaction.name.includes("REQUEST E-TFR")
  );

  console.log("What transactions would you like to ignore?");
  transactions.forEach((transaction, index) => {
    console.log(`${index}: ${transaction.name} - ${transaction.date} - ${transaction.amount}`);
  });

  const input = await askUser("Enter the transaction indexes separated by commas: ");
  const indexes = input.length ? input.split(",").map(Number) : [];
  const pickedTransactions: Transaction[] = [];
  indexes.forEach((index) => pickedTransactions.push(transactions[index]));

  txDb.empty(bank);
  console.log(
    "Ignoring:",
    pickedTransactions.map((tx) => ({ name: tx.name, amount: tx.amount }))
  );
  pickedTransactions.forEach((tx) => txDb.add(bank, tx));
};

export const ignoreTransactionByName = async (transactionName: string, bank = Bank.td) => {
  const { startDate, endDate } = getCycleDates(new Date(firstCycleStart));
  const bankTransactions = await getBankTx(bank, startDate, endDate);
  const transaction = bankTransactions.find((transaction) => transaction.name === transactionName);
  assert(transaction, `Could not find a transaction with name: ${transactionName}`);

  txDb.add(bank, transaction);
  console.log("Ignoring:", {
    name: transaction.name,
    amount: transaction.amount,
  });
};

export const ignoreTransactionById = async (transactionId: string, bank = "td") => {
  assert(bank === "td" || bank === "amex" || bank === "tangerine", "Bank is not currently supported");
  const { startDate, endDate } = getCycleDates(new Date(firstCycleStart));
  const bankTransactions = await getBankTx(bank, startDate, endDate);
  const transaction = bankTransactions.find((transaction) => transaction.transaction_id === transactionId);
  assert(transaction, `Could not find a transaction with id: ${transactionId}`);

  txDb.add(bank, transaction);
  console.log("Ignoring:", {
    name: transaction.name,
    amount: transaction.amount,
  });
};

export const showIgnored = async (bank = Bank.td) => {
  console.log(
    txDb.list(bank).map((transaction) => `${transaction.date}: ${transaction.name} - ${transaction.amount}$`)
  );
};

interface MinTransaction {
  name: string;
  transaction_id: string;
}

export const filterTransactions = <T extends MinTransaction>(transactions: T[], bank: Bank) => {
  const ignoredTransactionIds = txDb.list(bank).map((tx) => tx.transaction_id);
  const ignoredNames = namesDb.list(bank);
  return transactions.filter((transaction) => {
    if (ignoredTransactionIds.includes(transaction.transaction_id)) return false;
    if (ignoredNames.includes(transaction.name)) return false;
    if (transaction.name.includes("TFR-TO C/C")) return false;
    return true;
  });
};
