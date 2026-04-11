export const BASE_URL = import.meta.env.VITE_API_URL || 'https://bsng-backend-4g7x.vercel.app';

export function getImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // /img/custom/ paths are uploaded files stored on the backend server.
    // WARNING: On Render/Vercel, these are deleted on restart unless Cloudinary is configured!
    // Permanent solution is Cloudinary (http/https paths).
    if (path.startsWith('/img/custom/')) return `${BASE_URL}${path}`;
    if (path.startsWith('/img/')) return path; // bundled static images (shipped with frontend)
    return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('bsng_token');
    const siteId = localStorage.getItem('selectedSiteId');
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(siteId ? { 'X-Site-Id': siteId } : {}),
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
        const errorText = await response.text();
        let message = `API Error: ${response.statusText}`;
        try {
            const errorJson = JSON.parse(errorText);
            message = errorJson.message || message;
        } catch (e) {
            // Not JSON
            message = errorText || message;
        }
        throw new Error(message);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
}
