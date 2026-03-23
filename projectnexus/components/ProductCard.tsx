import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export interface ProductCardItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  modelSource: number;
}

interface ProductCardProps {
  product: ProductCardItem;
  onPress?: (id: string) => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(product.id)}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{product.price.toLocaleString('tr-TR')} TL</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  name: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    minHeight: 36,
  },
  price: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
