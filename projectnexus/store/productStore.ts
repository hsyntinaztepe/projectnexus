import { create } from 'zustand';
import { productsAPI, type Product } from '@/services/api';

interface ProductState {
  products: Product[];
  favorites: Product[];
  isLoadingProducts: boolean;
  isLoadingFavorites: boolean;
  lastSearchedUrl: string;
  error: string | null;

  // Actions
  fetchProducts: (params?: { category?: string; search?: string }) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (id: string) => boolean;
  setLastSearchedUrl: (url: string) => void;
  getProductById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  favorites: [],
  isLoadingProducts: false,
  isLoadingFavorites: false,
  lastSearchedUrl: '',
  error: null,

  fetchProducts: async (params) => {
    set({ isLoadingProducts: true, error: null });
    try {
      const response = await productsAPI.list(params);
      set({ products: response.data, isLoadingProducts: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Ürünler yüklenirken hata oluştu',
        isLoadingProducts: false,
      });
    }
  },

  fetchFavorites: async () => {
    set({ isLoadingFavorites: true });
    try {
      const response = await productsAPI.getFavorites();
      set({ favorites: response.data, isLoadingFavorites: false });
    } catch {
      set({ isLoadingFavorites: false });
    }
  },

  toggleFavorite: async (product: Product) => {
    const { favorites } = get();
    const exists = favorites.some((f) => f.id === product.id);

    // Optimistic update
    if (exists) {
      set({ favorites: favorites.filter((f) => f.id !== product.id) });
    } else {
      set({ favorites: [...favorites, product] });
    }

    try {
      if (exists) {
        await productsAPI.removeFavorite(product.id);
      } else {
        await productsAPI.addFavorite(product.id);
      }
    } catch {
      // Revert on error
      if (exists) {
        set({ favorites: [...get().favorites, product] });
      } else {
        set({ favorites: get().favorites.filter((f) => f.id !== product.id) });
      }
    }
  },

  isFavorite: (id: string) => {
    return get().favorites.some((f) => f.id === id);
  },

  setLastSearchedUrl: (url: string) => set({ lastSearchedUrl: url }),

  getProductById: (id: string) => {
    return get().products.find((p) => p.id === id);
  },
}));
