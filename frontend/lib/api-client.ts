// Frontend/lib/api-client.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

// ========== Fungsi untuk mengambil token dari localStorage ==========
const getTokenFromStore = (): string | null => {
  try {
    const authStore = localStorage.getItem('auth-store');
    if (!authStore) return null;
    const parsed = JSON.parse(authStore);
    const token = parsed.state?.token || parsed.token || null;
    return token;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to read auth-store:', e);
    }
    return null;
  }
};

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== INTERCEPTOR: Add token to requests ==========
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token langsung dari localStorage, tidak bergantung pada store
    const token = getTokenFromStore();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== INTERCEPTOR: Handle response errors ==========
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      
      // Jangan redirect jika error terjadi di endpoint login/register
      if (requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/register')) {
        // Biarkan login page yang handle error ini
        return Promise.reject(error);
      }
      
      // Hapus token lokal
      localStorage.removeItem('auth-store');
      localStorage.removeItem('token');
      
      // Redirect ke login jika belum di halaman login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== API Methods ==========
export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      apiClient.post('/api/auth/register', data),
    login: (data: { email: string; password: string }) =>
      apiClient.post('/api/auth/login', data),
  },
  users: {
    getProfile: () => apiClient.get('/api/users/profile'),
    getAll: () => apiClient.get('/api/users'),
    getById: (id: string | number) => apiClient.get(`/api/users/${id}`),
    getStatistics: () => apiClient.get('/api/users/statistics'),
    getSettings: () => apiClient.get('/api/users/settings'),
    updateSettings: (data: any) => apiClient.patch('/api/users/settings', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) => 
      apiClient.post('/api/users/change-password', data),
  },
  transactions: {
    getAll: (params?: { 
      page?: number; 
      limit?: number; 
      categoryId?: string;
      startDate?: string;
      endDate?: string;  
    }) =>
    apiClient.get('/api/transactions', { params }),
    getById: (id: string | number) =>
      apiClient.get(`/api/transactions/${id}`),
    create: (data: any) => apiClient.post('/api/transactions', data),
    update: (id: string | number, data: any) =>
      apiClient.patch(`/api/transactions/${id}`, data),
    delete: (id: string | number) =>
      apiClient.delete(`/api/transactions/${id}`),
    getStats: (params?: { startDate?: string; endDate?: string }) =>
      apiClient.get('/api/transactions/stats', { params }),
  },
  accounts: {
    getAll: () => apiClient.get('/api/accounts'),
    getById: (id: string | number) => apiClient.get(`/api/accounts/${id}`),
    create: (data: any) => apiClient.post('/api/accounts', data),
    update: (id: string | number, data: any) =>
      apiClient.patch(`/api/accounts/${id}`, data),
    delete: (id: string | number) =>
      apiClient.delete(`/api/accounts/${id}`),
  },
  categories: {
    getAll: () => apiClient.get('/api/categories'),
    create: (data: any) => apiClient.post('/api/categories', data),
    update: (id: string | number, data: any) =>
      apiClient.patch(`/api/categories/${id}`, data),
    delete: (id: string | number) =>
      apiClient.delete(`/api/categories/${id}`),
  },
  budgets: {
    getAll: () => apiClient.get('/api/budgets'),
    getById: (id: string | number) => apiClient.get(`/api/budgets/${id}`),
    create: (data: any) => apiClient.post('/api/budgets', data),
    update: (id: string | number, data: any) =>
      apiClient.patch(`/api/budgets/${id}`, data),
    delete: (id: string | number) =>
      apiClient.delete(`/api/budgets/${id}`),
  },
  goals: {
    getAll: () => apiClient.get('/api/goals'),
    getById: (id: string | number) => apiClient.get(`/api/goals/${id}`),
    create: (data: any) => apiClient.post('/api/goals', data),
    update: (id: string | number, data: any) =>
      apiClient.patch(`/api/goals/${id}`, data),
    delete: (id: string | number) =>
      apiClient.delete(`/api/goals/${id}`),
    addContribution: (id: string | number, data: { amount: number; notes?: string }) =>
      apiClient.post(`/api/goals/${id}/contributions`, data),
  },
};

export { apiClient };
export default apiClient;