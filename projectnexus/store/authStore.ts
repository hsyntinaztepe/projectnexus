import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, type UserResponse, type LoginRequest, type RegisterRequest } from '@/services/api';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateUser: (data: Partial<Pick<UserResponse, 'username' | 'full_name' | 'avatar_url'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (data: LoginRequest) => {
    const response = await authAPI.login(data);
    const { access_token, user } = response.data;
    await AsyncStorage.setItem('auth_token', access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  register: async (data: RegisterRequest) => {
    const response = await authAPI.register(data);
    const { access_token, user } = response.data;
    await AsyncStorage.setItem('auth_token', access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const response = await authAPI.getMe();
        set({ user: response.data, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await AsyncStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: async (data) => {
    const response = await authAPI.updateMe(data);
    set({ user: response.data });
  },
}));
