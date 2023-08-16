import assert from "assert";
import { Command } from "commander";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import * as readline from "readline";

import { getCycleDates } from "./utils/dates";
import config from "./utils/config-with-env";

const tdAccessToken = config.get("bankTokens.td");

// Create a new Plaid client instance
const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": config.get("plaid.clientId"),
      "PLAID-SECRET": config.get("plaid.secret"),
    },
  },
});

const client = new PlaidApi(configuration);

const askQuestion = (query: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(query, (answer: string) => {
      resolve(answer);
      rl.close();
    })
  );
};

/**
 * Fetches a list of transactions using the provided access token.
 * The date range is determined by cycleDates based on the given reference date.
 *
 * @param {string} accessToken - Access token for making the API request.
 * @returns {Array} An array of transaction data within the specified date range.
 */
const getTransactions = async (accessToken: string) => {
  const cycleDates = getCycleDates(new Date("January 6, 2023"));
  console.log(
    `Fetching e-transfers ${cycleDates.startDate} --> ${cycleDates.endDate}`
  );
  const td = await client.transactionsGet({
    access_token: accessToken,
    start_date: cycleDates.startDate,
    end_date: cycleDates.endDate,
  });
  return td.data.transactions;
};

/**
 * Displays a list of e-transfer transactions and prompts the user to choose
 * transactions to ignore. The ignored transaction IDs are saved to a file.
 */
const ignoreTransactions = async () => {
  console.log("What transactions would you like to ignore?");
  const transactions = (await getTransactions(tdAccessToken)).filter(
    (transaction) =>
      transaction.name.includes("E-TRANSFER") ||
      transaction.name.includes("SEND E-TFR") ||
      transaction.name.includes("REQUEST E-TFR")
  );

  transactions.forEach((transaction, index) => {
    console.log(
      `${index}: ${transaction.name} - ${transaction.date} - ${transaction.amount}`
    );
  });

  const ids: string[] = [];
  const indexes = (
    await askQuestion("Enter the transaction indexes separated by commas: ")
  )
    .split(",")
    .map(Number);
  indexes.forEach((index) => {
    ids.push(transactions[index].transaction_id);
  });

  console.log(
    "Ignoring:",
    ids.map((id) => {
      const transaction = transactions.find((t) => t.transaction_id === id);
      return { name: transaction?.name, amount: transaction?.amount };
    })
  );
  writeFileSync("db.td.ids", ids.join(","));
};

/**
 * Adds a specific transaction to the list of ignored transactions.
 *
 * @param {string} transactionName - Name of the transaction to be ignored.
 */
const addTransaction = async (transactionName: string) => {
  const transaction = (await getTransactions(tdAccessToken)).find(
    (transaction) => transaction.name === transactionName
  );
  assert(
    transaction,
    `Could not find a transaction with name: ${transactionName}`
  );

  const transactionIds = readFileSync("db.td.ids", "utf8").split(",");

  const id = transaction.transaction_id;
  assert(!transactionIds.includes(id), "Transaction already included");
  transactionIds.push(id);

  console.log("Ignoring:", {
    name: transaction.name,
    amount: transaction.amount,
  });
  writeFileSync("db.td.ids", transactionIds.join(","));
};

/**
 * Displays the list of ignored transactions, if any, along with their details.
 */
const showIgnoredTransactions = async () => {
  if (!existsSync("db.td.ids")) {
    console.log("[]");
    return;
  }
  const ignoredTransactionIds = readFileSync("db.td.ids", "utf8").split(",");
  const transactions = (await getTransactions(tdAccessToken)).filter(
    (transaction) => ignoredTransactionIds.includes(transaction.transaction_id)
  );
  console.log(
    transactions.map(
      (transaction) =>
        `${transaction.date}: ${transaction.name} - ${transaction.amount}$`
    )
  );
};

const program = new Command();
program.version("1.0.0");
program.allowUnknownOption();

program
  .command("add <transactionName>")
  .description("Ignores an extra transaction provided its name")
  .action((transactionName) => {
    addTransaction(transactionName);
  });

program
  .command("reset")
  .description("Ignore transactions")
  .action(() => {
    ignoreTransactions();
  });

program
  .command("show")
  .description("Show ignored transactions")
  .action(() => {
    showIgnoredTransactions();
  });

program.parse(process.argv);
