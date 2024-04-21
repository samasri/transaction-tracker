import { Table } from "./components/table";
import { getCycleDates } from "../lib/date-cycle-detector";
import { spendingsRows } from "./spendings";
import { RefreshButton } from "./components/refresh";

export const dynamic = "force-dynamic";

const Page = async () => {
  const { startDate, endDate } = getCycleDates(new Date("January 11, 2019"), new Date());
  const rows = await spendingsRows(startDate, endDate);
  return (
    <>
      <h1>Transaction Tracker</h1>
      <h3>
        Displaying spendings: {startDate} --{">"} {endDate}
      </h3>
      <Table rows={rows}></Table>
      <RefreshButton />
    </>
  );
};

export default Page;
