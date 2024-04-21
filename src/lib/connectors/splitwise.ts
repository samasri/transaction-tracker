import assert from "assert";
import axios from "axios";
import { splitwise } from "../config-manager";

const splitWiseUrl = "https://secure.splitwise.com/api/v3.0";

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

export const getOwedTotal = async (groupId = splitwise.get().groupId) => {
  if (!groupId) return 0;
  const { apiKey } = splitwise.get();
  assert(apiKey, "Splitwise is not configured correctly");
  const response = await axios.get(`${splitWiseUrl}/get_group/${groupId}`, {
    headers: {
      Authorization: `Bearer ${splitwise.get().apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const { data } = response as SplitWiseResponse;
  const debts = data.group.original_debts;
  return debts.reduce((total, debt) => {
    const { currency_code: currencyCode, amount } = debt;
    assert(
      currencyCode === "USD" ||
        currencyCode === "CAD" ||
        currencyCode === "GBP" ||
        currencyCode === "EUR" ||
        currencyCode === "BRL",
      `Unsupport currency is found in SplitWise debts: ${currencyCode}`
    );
    switch (currencyCode) {
      case "USD":
        return total + Number(amount) * 1.33;
      case "EUR":
        return total + Number(amount) * 1.47;
      case "GBP":
        return total + Number(amount) * 1.69;
      case "BRL":
        return total + Number(amount) * 0.27;
      case "CAD":
        return total + Number(amount);
    }
  }, 0);
};
