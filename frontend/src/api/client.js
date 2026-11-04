/**
 * Centralized API Client
 * Automatically attaches Authorization header from localStorage.
 */
export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('hms_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const url = endpoint.startsWith('http') ? endpoint : endpoint;
    const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}
