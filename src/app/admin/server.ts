"use server";

import { plaid, pushbullet, splitwise } from "@/lib/config-manager";

interface PlaidConfig {
  clientId?: string;
  secret?: string;
}

export const savePlaidConfig = ({ clientId, secret }: PlaidConfig = {}) => {
  if (clientId) plaid.setPlaidClientId(clientId);
  if (secret) plaid.setPlaidSecret(secret);
};

interface SplitwiseConfig {
  apiKey?: string;
  groupId?: string;
}

export const saveSplitwiseConfig = ({ apiKey, groupId }: SplitwiseConfig = {}) => {
  if (apiKey) splitwise.setSplitwiseApiKey(apiKey);
  if (groupId) splitwise.setSplitwiseGroupId(groupId);
};

interface PushbulletConfig {
  apiToken?: string;
  targetDevice?: string;
}

export const savePushbulletConfig = ({ apiToken, targetDevice }: PushbulletConfig = {}) => {
  if (apiToken) pushbullet.setPushbulletApiKey(apiToken);
  if (targetDevice) pushbullet.setPushbulletTargetDevice(targetDevice);
};
