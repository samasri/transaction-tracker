import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";

const CLIENT_ID = process.env.CLIENT_ID;
const SECRET = process.env.SECRET;

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": CLIENT_ID,
      "PLAID-SECRET": SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

// Step 1: Create a Plaid Link
async function createLinkToken() {
  const params = {
    user: {
      client_user_id: "tangerine-client",
    },
    client_name: "tangerine-client-app",
    products: [Products.Transactions],
    country_codes: [CountryCode.Ca],
    language: "en",
  };

  try {
    const response = await client.linkTokenCreate(params);
    const linkToken = response.data.link_token;
    console.log("Link Token:", linkToken);
  } catch (err) {
    // Handle error
    console.error(err);
  }
}

// Step 2: Use public token (obtained from running create-link.html) to get a permanent access token
async function getAccessToken(publicToken: string) {
  const accessTokenResponse = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });
  const accessToken = accessTokenResponse.data.access_token;
  console.log("Access Token:", accessToken);

  const transcationsResponse = await client.transactionsGet({
    access_token: accessToken,
    start_date: "2023-01-01",
    end_date: "2023-04-30",
  });
  // Display the transactions for the Amex credit card account
  console.log("Transactions:", transcationsResponse.data.transactions);
  console.log("Access Token:", accessToken);
}

// createLinkToken();
// getAccessToken();
