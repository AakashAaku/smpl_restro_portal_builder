import { getAuthToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || "/api";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
}

export async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
    const token = getAuthToken();
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Optional: handle token expiration/logout
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

export const api = {
    get: (endpoint: string, options?: RequestOptions) => fetchWithAuth(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, body?: any, options?: RequestOptions) => fetchWithAuth(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint: string, body?: any, options?: RequestOptions) => fetchWithAuth(endpoint, { ...options, method: 'PUT', body }),
    patch: (endpoint: string, body?: any, options?: RequestOptions) => fetchWithAuth(endpoint, { ...options, method: 'PATCH', body }),
    delete: (endpoint: string, options?: RequestOptions) => fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};
