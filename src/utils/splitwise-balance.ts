import assert from "assert";
import axios from "axios";
import config from "./config-with-env";

const splitWiseUrl = "https://secure.splitwise.com/api/v3.0";

const apiKey = config.get("splitwise.apiKey");

interface SplitWiseResponse {
  data: {
    group: {
      original_debts: {
        currency_code: string;
        amount: number;
      }[];
    };
  };
}

export const getBalance = async (groupId: string) => {
  const response = await axios.get(`${splitWiseUrl}/get_group/${groupId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const { data } = response as SplitWiseResponse;
  const debts = data.group.original_debts;
  let total = 0;
  debts.forEach((debt) => {
    const { currency_code: currencyCode, amount } = debt;
    assert(
      currencyCode === "USD" ||
        currencyCode === "CAD" ||
        currencyCode === "EUR",
      `Unsupport currency is found in SplitWise debts: ${currencyCode}`
    );
    if (currencyCode === "USD") total += Number(amount) * 1.33;
    else if (currencyCode === "EUR") total += Number(amount) * 1.47;
    else total += Number(amount);
  });
  return total;
};
