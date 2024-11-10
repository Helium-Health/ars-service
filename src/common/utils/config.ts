import { ConfigKey, configKeys, IConfig } from '../types';
import { Utility } from './utility';

const DEFAULT_TIMEZONE = 'Africa/Lagos';
const RAPID_PRO_URL = 'http://localhost:8080';

export const configKeyMap = Object.freeze({
  TIME_ZONE: configKeys[0],
  RAPID_PRO_URL: configKeys[1],
  RAPID_PRO_API_TOKEN: configKeys[2],
  RAPID_PRO_CHANNEL_UUID: configKeys[3],
});

let config: IConfig;
const mutableKeys: ConfigKey[] = [
  configKeyMap.RAPID_PRO_URL,
  configKeyMap.RAPID_PRO_CHANNEL_UUID,
  configKeyMap.RAPID_PRO_API_TOKEN,
];

export function initConfig(): void {
  config = {
    rapidProUrl: getEnv<string>('RAPID_PRO_URL', RAPID_PRO_URL),
    rapidProAPIToken: getEnv<string>('RAPID_PRO_API_TOKEN', ''),
    rapidProChannelUUID: getEnv<string>('RAPID_PRO_CHANNEL_UUID', ''),
    timeZone: getEnv<string>('TIMEZONE', DEFAULT_TIMEZONE),
  };
}

export function setConfigKey(key: ConfigKey, value: string): void {
  if (mutableKeys.includes(key)) {
    config[key] = value;
  }
}

export function mergeConfig(data: IConfig): void {
  Object.entries(data).forEach(([key, value]) => {
    setConfigKey(key as ConfigKey, value);
  });
}

export async function storeConfig(
  redisSetFn: (key: string, value: string) => void,
) {
  await redisSetFn('config', JSON.stringify(config));
}

export function getConfigValue(key: ConfigKey): string {
  return config[key];
}

export function getEnv<Type>(key: string, fallBack: Type): Type {
  const value: string | undefined = process.env[key];
  if (Utility.is.empty(value)) return fallBack;
  return value as Type;
}
