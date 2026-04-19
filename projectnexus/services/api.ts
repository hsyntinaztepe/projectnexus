import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator → 10.0.2.2, fiziksel cihaz → local IP adresiniz
// iOS simulator → localhost
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'
  : 'https://your-production-url.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor — her istekte Authorization header'ı ekle
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — 401 hatalarında token temizle
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  },
);

// ─── Auth API ──────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export const authAPI = {
  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),

  getMe: () => api.get<UserResponse>('/auth/me'),

  updateMe: (data: Partial<Pick<UserResponse, 'username' | 'full_name' | 'avatar_url'>>) =>
    api.put<UserResponse>('/auth/me', data),
};

// ─── Products API ──────────────────────────────────────────────────────

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product {
  id: string;
  name: string;
  source_url: string;
  price: number | null;
  dimensions: ProductDimensions | null;
  image_url: string | null;
  model_url: string | null;
  colors: string[];
  category: string | null;
  description: string | null;
  platform: string | null;
  created_at: string;
}

export const productsAPI = {
  list: (params?: { category?: string; search?: string; skip?: number; limit?: number }) =>
    api.get<Product[]>('/products/', { params }),

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`),

  getCategories: () =>
    api.get<string[]>('/products/categories'),

  // Favoriler
  getFavorites: () =>
    api.get<Product[]>('/products/user/favorites'),

  addFavorite: (productId: string) =>
    api.post(`/products/${productId}/favorite`),

  removeFavorite: (productId: string) =>
    api.delete(`/products/${productId}/favorite`),

  isFavorite: (productId: string) =>
    api.get<{ is_favorite: boolean }>(`/products/${productId}/is-favorite`),

  // Arama geçmişi
  getSearchHistory: (limit?: number) =>
    api.get('/products/user/search-history', { params: { limit } }),

  addSearchHistory: (searchUrl: string, productId?: string) =>
    api.post('/products/user/search-history', null, {
      params: { search_url: searchUrl, product_id: productId },
    }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
