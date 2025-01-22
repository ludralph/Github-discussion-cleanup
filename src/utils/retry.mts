import { MAX_RETRIES, RETRY_DELAY } from '../config.mts';

export const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < retries) {
        const retryAfter = parseInt(error?.response?.headers['retry-after'], 10) || RETRY_DELAY;
        console.warn(`Error occurred: ${error.message}. Retrying in ${retryAfter}ms...`);
        await new Promise(res => setTimeout(res, retryAfter));
      } else {
        throw new Error(`Max retries reached: ${error.message}`);
      }
    }
  }
};
