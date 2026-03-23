import { useEffect } from 'react';
import { router } from 'expo-router';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import ProductCard from '@/components/ProductCard';
import URLInput from '@/components/URLInput';
import { Colors, Spacing } from '@/constants/theme';
import { mockProducts } from '@/data/mockProducts';
import { useProductStore } from '@/store/productStore';

export default function HomeScreen() {
  const { products, setProducts, setLastSearchedUrl } = useProductStore();

  useEffect(() => {
    if (!products.length) {
      setProducts(mockProducts);
    }
  }, [products.length, setProducts]);

  function handleSearch(url: string) {
    setLastSearchedUrl(url);
    Alert.alert('URL Alındı', `Girilen URL: ${url}`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Project Nexus</Text>
        <Text style={styles.subtitle}>Ürün linkini girerek keşfetmeye başla</Text>

        <URLInput onSubmit={handleSearch} />

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(id) => router.push({ pathname: '/viewer/[id]', params: { id } })}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  grid: {
    paddingBottom: Spacing.lg,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
