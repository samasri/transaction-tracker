import assert from "assert";
import axios from "axios";
import { Command } from "commander";

import { connectedBanks, connectBank } from "./lib/connectors/plaid";
import { sendPushNotification } from "./lib/connectors/pushbullet";
import { getCycleDates } from "./lib/date-cycle-detector";
import { calculateExpenses } from "./lib/expenses-calculator";
import { printTransactions } from "./lib/transactions-printer";
import { saveTransactionHistory } from "./lib/transaction-saver";
import { Bank, ignoreTransactionByName, resetIgnored, showIgnored } from "./lib/transaction-filter";
import readline from "readline";
import { stdin, stdout } from "node:process";

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

const serverUrl = "http://localhost:2340"; // TODO: move to config

const program = new Command();
program.version("1.0.0");
program.allowUnknownOption();

program
  .command("show")
  .option("-v, --verbose", "Print more information about transactions")
  .option("-u, --ungrouped", "Do not group transactions with the same name together")
  .description("Displays the spendings in the CLI")
  .action(async (options: { verbose?: boolean; ungrouped?: boolean }) => {
    const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"), new Date());
    const { transactions, summary } = await calculateExpenses(startDate, endDate);
    printTransactions(
      transactions,
      summary,
      { startDate, endDate },
      { verbose: options.verbose, condensed: !options.ungrouped }
    );
  });

program
  .command("save")
  .description("Saves transactions in CSV")
  .action(() => {
    saveTransactionHistory();
  });

program
  .command("send")
  .description("Sends notification with the transaction totals")
  .action(async () => {
    const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"), new Date());
    const response = await axios.get(`${serverUrl}/api/refresh`);
    sendPushNotification(
      `Spendings`,
      `Cycle: ${startDate} --> ${endDate}
So far, you've spent: ${response.data.balance.toFixed(2)}$
Go to http://192.168.0.103/expenses to learn more`
    );
  });

const credentialsCommand = program
  .command("credentials")
  .description("Controls the Plaid credentials of banks connected to the application");
credentialsCommand
  .command("list")
  .description("Lists all currently connected banks")
  .action(() => {
    connectedBanks().forEach((bank) => console.log("-", bank.toLowerCase()));
  });

credentialsCommand
  .command("update")
  .argument("<bank>", "bank in which command should take effect")
  .description("Updates the credentials for the bank")
  .action(async (bank) => {
    try {
      assert(bank === Bank.td || bank === Bank.amex || bank === Bank.tangerine, `${bank} is an invalid bank`);
      const linkToken = await connectBank.getLinkToken(bank, true);
      console.log("Place the following token in your _create-link.html_ and run it in a browser:", linkToken);
      const publicToken = await askUser(
        "Once you login and get back a `public-development-*` token (check browser console log), paste it here to continue"
      );
      assert(publicToken.includes("public-development-"));
      await connectBank.saveAccessToken(publicToken, bank);
    } catch (err) {
      const error = err as Error;
      console.error(error.message);
      process.exit(1);
    }
  });

const ignoreCommand = program
  .command("ignore")
  .description("Ignores certain transactions from showing and being used in calculations");
ignoreCommand
  .command("add")
  .argument("<transactionName>", "name of transaction that should be ignored")
  .argument("[bank]", "bank in which command should take effect")
  .description("Ignores a transaction provided its name")
  .action((transactionName: string, bank: Bank) => {
    if (bank) assert(bank === Bank.td || bank === Bank.amex, `${bank} is an invalid bank`);
    ignoreTransactionByName(transactionName, bank);
  });

ignoreCommand
  .command("reset")
  .argument("[bank]", "bank in which command should take effect")
  .description("Ignore transactions")
  .action((bank) => {
    if (bank) assert(bank === Bank.td || bank === Bank.amex, `${bank} is an invalid bank`);
    resetIgnored(bank);
  });

ignoreCommand
  .command("show")
  .argument("[bank]", "bank in which command should take effect")
  .description("Show ignored transactions")
  .action((bank) => {
    if (bank) assert(bank === Bank.td || bank === Bank.amex, `${bank} is an invalid bank`);
    showIgnored(bank);
  });

program.parse(process.argv);
