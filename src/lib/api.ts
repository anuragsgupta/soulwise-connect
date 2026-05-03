/**
 * API Utilities for making authenticated requests
 * Uses HTTP-only cookie authentication
 */

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Make an authenticated API request using cookies
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with the response
 */
export async function authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const defaultOptions: FetchOptions = {
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}

/**
 * Make an authenticated GET request
 */
export async function apiGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' });
}

/**
 * Make an authenticated POST request
 */
export async function apiPost(url: string, data?: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Make an authenticated PATCH request
 */
export async function apiPatch(url: string, data?: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Make an authenticated PUT request
 */
export async function apiPut(url: string, data?: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Make an authenticated DELETE request
 */
export async function apiDelete(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' });
}

/**
 * Handle API response and return JSON data
 * Throws error if response is not OK
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}
