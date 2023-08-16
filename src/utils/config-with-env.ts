import { config as loadEnv } from "dotenv";
loadEnv();
import ogConfig from "config";

export default {
  get: <T = string>(setting: string) => ogConfig.get<T>(setting),
};
