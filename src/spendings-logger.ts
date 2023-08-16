import { getCycleDates } from "./utils/dates";
import {
  calculateBalance,
  printTransactions,
} from "./utils/print-transactions";
import config from "./utils/config-with-env";
import { getTransactions } from "./utils/get-transactions";

const amex = config.get("bankTokens.amex");
const tangerine = config.get("bankTokens.tangerine");
const td = config.get("bankTokens.td");
const splitWiseGroupId = config.get("splitwise.groupId");

/**
 * Display spendings for the current pay cycle.
 */
export const displaySpendings = async (print = true, verbose = false) => {
  const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"));
  const transactions = (
    await getTransactions({ amex, tangerine, td }, { startDate, endDate })
  ).filter(
    (transaction) =>
      new Date(transaction.authorized_date ?? startDate) >= new Date(startDate)
  );

  const { txTotal, balance } = await calculateBalance(
    transactions,
    splitWiseGroupId
  );
  if (print) {
    console.log(`Displaying spendings: ${startDate} --> ${endDate}`);
    printTransactions(transactions, txTotal, balance, verbose);
  }
  return { startDate, endDate, txTotal, balance };
};
