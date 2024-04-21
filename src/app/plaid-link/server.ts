"use server";

import { connectedBanks, connectBank } from "@/lib/connectors/plaid";

export const getToken = async (bank: string) => {
  const update = connectedBanks().includes(bank);
  return connectBank.getLinkToken(bank, update);
};

export const saveToken = async (publicToken: string, bank: string) => connectBank.saveAccessToken(publicToken, bank);
