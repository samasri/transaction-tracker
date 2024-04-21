"use server";

import { getCycleDates } from "@/lib/date-cycle-detector";
import { ignoreTransactionById } from "@/lib/transaction-filter";

import * as spendings from "../../transactions-cache";

export const ignorePayment = async (transactionId: string, bank: string) => ignoreTransactionById(transactionId, bank);

export const refresh = async () => {
  const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"), new Date());
  await spendings.refresh(startDate, endDate);
};
