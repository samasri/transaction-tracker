"use server";

import { sw } from "../../../lib/transaction-database";

export const saveSw = (id: string, isSplit: boolean) => sw.add(id, isSplit);
