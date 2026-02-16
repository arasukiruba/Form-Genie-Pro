const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

function getToken(): string | null {
    return localStorage.getItem('fg_token');
}

export function setToken(token: string): void {
    localStorage.setItem('fg_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('fg_token');
    localStorage.removeItem('fg_user');
}

export function getStoredUser(): any | null {
    const user = localStorage.getItem('fg_user');
    return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any): void {
    localStorage.setItem('fg_user', JSON.stringify(user));
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers,
    };

    if (options.body) {
        if (options.body instanceof FormData) {
            fetchOptions.body = options.body;
        } else {
            headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(options.body);
        }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, ...data };
    }

    return data;
}

// ─── Auth API ─────────────────────────────────────
export const authApi = {
    register: (formData: FormData) =>
        apiRequest('/auth/register', { method: 'POST', body: formData }),

    login: (username: string, password: string) =>
        apiRequest('/auth/login', { method: 'POST', body: { username, password } }),

    getProfile: () => apiRequest('/auth/me'),
};

// ─── Admin API ────────────────────────────────────
export const adminApi = {
    getUsers: (status?: string) =>
        apiRequest(`/admin/users${status ? `?status=${status}` : ''}`),

    getUserDetail: (id: string) =>
        apiRequest(`/admin/users/${id}`),

    approveUser: (id: string) =>
        apiRequest(`/admin/users/${id}/approve`, { method: 'PUT' }),

    rejectUser: (id: string) =>
        apiRequest(`/admin/users/${id}/reject`, { method: 'PUT' }),

    updateCredits: (id: string, amount: number, action: 'add' | 'reduce') =>
        apiRequest(`/admin/users/${id}/credits`, { method: 'PUT', body: { amount, action } }),

    getScreenshot: (id: string) =>
        apiRequest(`/admin/users/${id}/screenshot`),

    toggleUserStatus: (id: string, status: 'approved' | 'disabled') =>
        apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } }),
};

// ─── Credits API ──────────────────────────────────
export const creditsApi = {
    getBalance: () => apiRequest('/credits/balance'),
    deduct: (count: number = 1) =>
        apiRequest('/credits/deduct', { method: 'POST', body: { count } }),
    getLogs: () => apiRequest('/credits/logs'),
};

// ─── QR Code ──────────────────────────────────────
export const getQrCodeUrl = () => apiRequest('/qr-code');

// ─── Announcements API ───────────────────────────
export const announcementsApi = {
    getActive: () => apiRequest('/announcements'),
    getAll: () => apiRequest('/announcements/all'),
    create: (title: string, message: string, type: string = 'info') =>
        apiRequest('/announcements', { method: 'POST', body: { title, message, type } }),
    remove: (id: string) =>
        apiRequest(`/announcements/${id}`, { method: 'DELETE' }),
    toggle: (id: string) =>
        apiRequest(`/announcements/${id}/toggle`, { method: 'PATCH' }),
};
