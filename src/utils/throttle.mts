import { REQUEST_DELAY } from '../config.mts';

let lastRequestTime = 0;

export const throttleRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const waitTime = Math.max(0, REQUEST_DELAY - (now - lastRequestTime));
  await new Promise(res => setTimeout(res, waitTime));
  lastRequestTime = Date.now();
  return fn();
};
