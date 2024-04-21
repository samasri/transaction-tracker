import assert from "assert";
import { config as loadEnv } from "dotenv";
import { readFileSync, writeFileSync } from "fs";

const updateEnv = (envKey: string, value: string) => {
  const oldEnv = readFileSync(".env", "utf-8").split("\n");
  const newEnv = oldEnv.map((line) => {
    if (line.startsWith(envKey)) return `${envKey}='${value}'`;
    return line;
  });
  if (!newEnv.some((line) => line?.startsWith(envKey))) newEnv.push(`${envKey}=${value}`);
  writeFileSync(".env", newEnv.join("\n"));
};

export const plaid = {
  get: () => {
    loadEnv({ override: true });
    assert(process.env.CLIENT_ID, "CLIENT_ID is not defined");
    assert(process.env.SECRET, "SECRET is not defined");
    return {
      clientId: process.env.CLIENT_ID as string,
      secret: process.env.SECRET as string,
    };
  },
  setPlaidClientId: (clientId: string) => updateEnv("CLIENT_ID", clientId),
  setPlaidSecret: (secret: string) => updateEnv("SECRET", secret),
};

export const splitwise = {
  get: () => {
    loadEnv({ override: true });
    return {
      apiKey: process.env.SPLITWISE_API_KEY as string | undefined,
      groupId: process.env.SPLITWISE_GROUP_ID as string | undefined,
    };
  },
  setSplitwiseApiKey: (apiKey: string) => updateEnv("SPLITWISE_API_KEY", apiKey),
  setSplitwiseGroupId: (groupId: string) => updateEnv("SPLITWISE_GROUP_ID", groupId),
};

export const pushbullet = {
  get: () => {
    loadEnv({ override: true });
    return {
      apiToken: process.env.PUSHBULLET_API_TOKEN as string | undefined,
      targetDevice: process.env.PUSHBULLET_TARGET_DEVICE as string | undefined,
    };
  },
  setPushbulletApiKey: (apiKey: string) => updateEnv("PUSHBULLET_API_TOKEN", apiKey),
  setPushbulletTargetDevice: (targetDevice: string) => updateEnv("PUSHBULLET_TARGET_DEVICE", targetDevice),
};

export const bankToken = {
  get: (bank: string, validate = true) => {
    loadEnv({ override: true });
    const envName = `ACCESS_TOKEN_${bank.toUpperCase()}`;
    if (validate) assert(process.env[envName], `${envName} is not defined`);
    return process.env[envName] as string;
  },
  set: (bank: string, token: string) => {
    const envName = `ACCESS_TOKEN_${bank.toUpperCase()}`;
    updateEnv(envName, token);
  },
  list: () => {
    loadEnv({ override: true });
    return Object.keys(process.env)
      .filter((key) => key.startsWith("ACCESS_TOKEN_"))
      .map((key) => key.replace("ACCESS_TOKEN_", ""));
  },
};
