import { PlaidContent } from "./content";
import { getToken } from "./server";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { bank: string };
}

const Page = async ({ searchParams }: Props) => {
  const { bank } = searchParams;
  if (!bank || bank.length === 0)
    return (
      <>
        <h1>Error</h1>
        <h2>bank parameter is not provided</h2>
      </>
    );

  const token = await getToken(bank);
  return <PlaidContent bank={bank} token={token} />;
};

export default Page;
