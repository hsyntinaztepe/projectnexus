import { create } from 'zustand';

import type { ProductCardItem } from '@/components/ProductCard';

interface ProductState {
  products: ProductCardItem[];
  lastSearchedUrl: string;
  setProducts: (products: ProductCardItem[]) => void;
  setLastSearchedUrl: (url: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  lastSearchedUrl: '',
  setProducts: (products) => set({ products }),
  setLastSearchedUrl: (url) => set({ lastSearchedUrl: url }),
}));
