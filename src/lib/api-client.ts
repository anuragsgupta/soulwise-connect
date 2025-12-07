/**
 * API Client utility for making authenticated requests
 * Uses HTTP-only cookies for authentication instead of localStorage tokens
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Make an authenticated API request
 * Automatically includes credentials (cookies) in the request
 */
export async function apiRequest(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters if provided
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl = `${url}?${searchParams.toString()}`;
  }

  // Always include credentials (cookies) and set default headers
  const defaultOptions: RequestInit = {
    credentials: 'include', // Send cookies automatically
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  return fetch(fullUrl, defaultOptions);
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (url: string, params?: Record<string, string>) =>
    apiRequest(url, { method: 'GET', params }),

  post: (url: string, data?: any) =>
    apiRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (url: string, data?: any) =>
    apiRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: (url: string, data?: any) =>
    apiRequest(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (url: string) =>
    apiRequest(url, { method: 'DELETE' }),
};
