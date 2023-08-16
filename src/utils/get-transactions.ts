import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

import config from "./config-with-env";
import { filterTransactions } from "./filter-transactions";

interface Tokens {
  amex: string;
  tangerine: string;
  td: string;
}

// Create a new Plaid client instance
const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": config.get("plaid.clientId"),
      "PLAID-SECRET": config.get("plaid.secret"),
    },
  },
});

const client = new PlaidApi(configuration);

const getBankTx = async (
  accessToken: string,
  startDate: string,
  endDate: string
) =>
  (
    await client.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    })
  ).data.transactions;

export const getTransactions = async (
  { amex, tangerine, td }: Tokens,
  { startDate, endDate }: { startDate: string; endDate: string },
  filter = true
) => {
  const amexTx = await getBankTx(amex, startDate, endDate);
  const tangerineTx = await getBankTx(tangerine, startDate, endDate);
  const tdTx = await getBankTx(td, startDate, endDate);
  if (filter)
    return [
      ...filterTransactions(amexTx, "amex"),
      ...filterTransactions(tangerineTx, "tangerine"),
      ...filterTransactions(tdTx, "td"),
    ];
  else return [...amexTx, ...tangerineTx, ...tdTx];
};
