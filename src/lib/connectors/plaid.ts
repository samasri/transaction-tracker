import assert from "assert";
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, LinkTokenCreateRequest, Products } from "plaid";

import { bankToken, plaid } from "../config-manager";

export type { Transaction } from "plaid";

let clientCache: PlaidApi;

const client = () => {
  if (!clientCache) {
    const { clientId, secret } = plaid.get();
    const configuration = new Configuration({
      basePath: PlaidEnvironments.development,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    });

    clientCache = new PlaidApi(configuration);
  }
  return clientCache;
};

export enum Bank {
  td = "td",
  amex = "amex",
  tangerine = "tangerine",
}

export const getBankTx = async (bank: string, startDate: string, endDate: string) => {
  const transactions = (
    await client().transactionsGet({
      access_token: bankToken.get(bank),
      start_date: startDate,
      end_date: endDate,
      options: { count: 500 },
    })
  ).data.transactions;
  assert(transactions.length < 500),
    "Maximum transactions have been reached. Decrease the date range to get all the transactions";
  return transactions;
};

export const connectedBanks = () => bankToken.list();

export const connectBank = {
  // Step 1: Get link token (optionally pass existing access token to update)
  getLinkToken: async (bank: string, update: boolean) => {
    const accessToken = bankToken.get(bank, false);
    if (update)
      assert(accessToken, `${bank} is not currently connected. Rerun with update=false to create a new connection`);

    const params: LinkTokenCreateRequest = {
      user: { client_user_id: `${bank}-client` },
      client_name: `${bank}-client-app`,
      products: [Products.Transactions],
      country_codes: [CountryCode.Ca],
      language: "en",
    };
    if (accessToken) params.access_token = accessToken;

    const response = await client().linkTokenCreate(params);
    return response.data.link_token;
  },

  // Step 2: Send to UI, authenticate, and retrieve public token

  // Step 3: Exchange public token with an access token
  saveAccessToken: async (publicToken: string, bank: string) => {
    const accessTokenResponse = await client().itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = accessTokenResponse.data.access_token;
    bankToken.set(bank, accessToken);
    console.log("Access Token:", accessToken);
  },
};
