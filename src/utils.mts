// Retry with exponential backoff
export const retryWithBackoff = async (fn, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1 || !isRateLimitError(error)) throw error;
  
        console.warn(`Retrying in ${delay}ms due to rate limit...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  };
  
  // Check if the error is a rate-limiting error
  export const isRateLimitError = (error) =>
    error.message.includes('was submitted too quickly');
  
  // Delay function
  export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  