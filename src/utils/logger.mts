export const logRateLimits = (headers: any) => {
    console.log(`Rate Limit: ${headers['x-ratelimit-remaining']}/${headers['x-ratelimit-limit']}`);
    console.log(`Rate Limit Reset: ${new Date(headers['x-ratelimit-reset'] * 1000).toISOString()}`);
  };
  