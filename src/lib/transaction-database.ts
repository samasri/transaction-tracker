import assert from "assert";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { Bank } from "./transaction-retriever";

interface Transaction {
  transaction_id: string;
  name: string;
  date: string;
  amount: number;
}

enum Kind {
  names = "names",
  tx = "tx",
  sw = "sw",
}

type SplitwiseDb = { [id: string]: boolean };

const dbFile = (bank: string, kind = Kind.tx) => `db/${bank.toString()}.${kind.toString()}`;
const swFile = `db/sw`;

const readTransactionsFile = (path: string) => {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf-8"));
};

export const ignoredTransactions = {
  empty: (bank: string) => writeFileSync(dbFile(bank), JSON.stringify([])),
  add: (bank: string, transaction: Transaction) => {
    const transactions = readTransactionsFile(dbFile(bank)) as Transaction[];
    assert(
      !transactions.map((tx) => tx.transaction_id).includes(transaction.transaction_id),
      "Transaction already exists"
    );
    transactions.push(transaction);
    writeFileSync(dbFile(bank), JSON.stringify(transactions));
  },
  list: (bank: string) => readTransactionsFile(dbFile(bank)) as Transaction[],
};

export const names = {
  list: (bank: Bank) => {
    if (!existsSync(dbFile(bank, Kind.names))) return [];
    return readFileSync(dbFile(bank, Kind.names), "utf-8")
      .split(",")
      .map((str) => str.trim());
  },
};

export const sw = {
  empty: (bank: Bank) => writeFileSync(dbFile(bank, Kind.sw), JSON.stringify({})),
  add: (id: string, value: boolean) => {
    const records = (existsSync(swFile) ? JSON.parse(readFileSync(swFile, "utf-8")) : {}) as SplitwiseDb;
    records[id] = value;
    writeFileSync(swFile, JSON.stringify(records));
  },
  get: (id: string) => {
    const records = (existsSync(swFile) ? JSON.parse(readFileSync(swFile, "utf-8")) : {}) as SplitwiseDb;
    if (id in records) return records[id];
    return undefined;
  },
};
