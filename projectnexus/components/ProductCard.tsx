import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { Product } from '@/services/api';

interface ProductCardProps {
  product: Product;
  onPress?: (id: string) => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(product.id)}>
      <Image
        source={{ uri: product.image_url || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.dimensions && (
          <Text style={styles.dimensions}>
            {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} cm
          </Text>
        )}
        {product.price != null && (
          <Text style={styles.price}>{product.price.toLocaleString('tr-TR')} TL</Text>
        )}
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
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: Spacing.sm,
    gap: 2,
  },
  name: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    minHeight: 36,
  },
  dimensions: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  price: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
});
