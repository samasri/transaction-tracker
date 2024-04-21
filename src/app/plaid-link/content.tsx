"use client";

import { useRouter } from "next/navigation";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";

import { saveToken } from "./server";
import { useEffect } from "react";

export const dynamic = "force-dynamic";

interface Props {
  bank: string;
  token: string;
}

export const PlaidContent = ({ bank, token }: Props) => {
  const router = useRouter();
  const config: PlaidLinkOptions = {
    onSuccess: async (publicToken, metadata) => {
      console.log({ publicToken, metadata });
      await saveToken(publicToken, bank);
      router.push("/admin");
    },
    token,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) open();
  });

  return <></>;
};
