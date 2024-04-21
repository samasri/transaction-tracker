import { NextResponse } from "next/server";
import { getCycleDates } from "../../../lib/date-cycle-detector";
import * as spendings from "../../transactions-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"), new Date());
  const { summary } = await spendings.refresh(startDate, endDate);
  return NextResponse.json({ ...summary });
}
