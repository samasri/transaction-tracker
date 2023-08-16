import { Command } from "commander";
import { displaySpendings } from "./spendings-logger";
import { saveTransactionHistory } from "./save-history";
import { sendNotification } from "./send-notification";

const program = new Command();
program.version("1.0.0");
program.allowUnknownOption();

program
  .command("show")
  .option("-v, --verbose", "Print more information about transactions")
  .description("Displays the spendings in the CLI")
  .action((options: { verbose?: boolean }) => {
    displaySpendings(true, options.verbose ?? false);
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
  .action(() => {
    sendNotification();
  });

program.parse(process.argv);
