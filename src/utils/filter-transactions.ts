import { Transaction } from "plaid";
import { existsSync, readFileSync } from "fs";

const loadIgnoreConfig = () => {
  interface BankConfig {
    ids: string[];
    names: string[];
  }
  const ignored = {
    td: {} as BankConfig,
    tangerine: {} as BankConfig,
    amex: {} as BankConfig,
  };
  (["ids", "names"] as const).forEach((kind) => {
    (["td", "tangerine", "amex"] as const).forEach((bank) => {
      const fileName = `db.${bank}.${kind}`;
      if (existsSync(fileName))
        ignored[bank][kind] = readFileSync(fileName, "utf8")
          .split(",")
          .map((str) => str.trim());
    });
  });
  return ignored;
};

const ignored = loadIgnoreConfig();

export const filterTransactions = (
  transactions: Transaction[],
  bank: "td" | "tangerine" | "amex"
) =>
  transactions.filter(
    (transaction) =>
      (!ignored[bank]?.names ||
        ignored[bank].names.every((name) => transaction.name !== name)) &&
      (!ignored[bank]?.ids ||
        !ignored[bank].ids.includes(transaction.transaction_id)) &&
      !transaction.name.includes("TFR-TO C/C")
  );
