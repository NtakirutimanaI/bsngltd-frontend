export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/img/')) return path; // local static images
    return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('bsng_token');
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type to application/json if we are NOT sending FormData
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
}
