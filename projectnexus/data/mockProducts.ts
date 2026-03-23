import type { ProductCardItem } from '@/components/ProductCard';

export const mockProducts: ProductCardItem[] = [
  {
    id: '1',
    name: 'Üçlü Koltuk Takımı',
    price: 4299,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000',
    modelSource: require('../assets/models/duck.glb'),
  },
  {
    id: '2',
    name: 'Çalışma Masası',
    price: 2150,
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1000',
    modelSource: require('../assets/models/duck.glb'),
  },
  {
    id: '3',
    name: 'TV Ünitesi',
    price: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1000',
    modelSource: require('../assets/models/duck.glb'),
  },
  {
    id: '4',
    name: 'Berjer',
    price: 1350,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000',
    modelSource: require('../assets/models/duck.glb'),
  },
];
