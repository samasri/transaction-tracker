import Link from "next/link";

import { connectedBanks } from "@/lib/connectors/plaid";
import { Config } from "./config";
import { plaid, pushbullet, splitwise } from "@/lib/config-manager";

export const dynamic = "force-dynamic";

const capitalizeWord = (word: string) => {
  const [firstLetter, ...rest] = word;
  return `${firstLetter.toUpperCase()}${rest.join("").toLowerCase()}`;
};

const Page = async () => {
  const banks = connectedBanks();

  const config = {
    plaid: plaid.get(),
    splitwise: splitwise.get(),
    pushbullet: pushbullet.get(),
  };

  return (
    <>
      <h1>Admin Page</h1>
      <Config plaid={config.plaid} splitwise={config.splitwise} pushbullet={config.pushbullet} />
      <h2>Connected Banks</h2>
      <ul>
        {banks.map((bank) => (
          <li key={`li-${bank}`}>
            {`${capitalizeWord(bank)} `}
            <Link href={`/plaid-link?bank=${bank}`}>
              <button>Refresh Credential</button>
            </Link>
          </li>
        ))}
      </ul>
      <button>Add bank</button>
    </>
  );
};

export default Page;
