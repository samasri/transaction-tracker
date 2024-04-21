"use server";

import { getCycleDates } from "../../../lib/date-cycle-detector";
import * as spendings from "../../transactions-cache";

export const refresh = async () => {
  const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"), new Date());
  await spendings.refresh(startDate, endDate);
};
