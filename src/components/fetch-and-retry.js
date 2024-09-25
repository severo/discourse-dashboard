const sleep = async (delay) =>
  await new Promise((resolve) => setTimeout(resolve, delay));

export const fetchAndRetry = async (
  url,
  options,
  { fetchAfterMs = 10, retriesAfterMs = [200, 5 * 1000, 60 * 1000] } = {}
) => {
  let error;
  for (let retryAfterMs of retriesAfterMs) {
    try {
      await sleep(fetchAfterMs);
      const response = await fetch(url, options);
      if (!response.ok) {
        console.warn(
          `Failed to fetch ${url}: ${response.status} ${
            response.statusText
          } - Headers: ${JSON.stringify(response.headers)}`
        );
        await sleep(response.headers.get("Retry-After") ?? retryAfterMs);
        continue;
      }
      return response;
    } catch (e) {
      error = e;
    }
  }
  throw error;
};
