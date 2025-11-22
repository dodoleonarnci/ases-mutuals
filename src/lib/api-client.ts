/**
 * Client-side API helper that automatically includes the API key in requests.
 * 
 * NOTE: This requires NEXT_PUBLIC_API_KEY to be set in your environment variables.
 * The API key will be exposed to the client, so only use this for internal/admin applications
 * or in trusted environments.
 */

/**
 * Fetches from an API endpoint with the API key automatically included.
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options (headers, method, body, etc.)
 * @returns Promise<Response>
 */
export async function fetchWithApiKey(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_API_KEY is not set. API requests may fail.");
  }

  const headers = new Headers(options.headers);
  
  // Add API key to headers
  if (apiKey) {
    headers.set("x-api-key", apiKey);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

