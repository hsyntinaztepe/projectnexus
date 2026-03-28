import { useEffect } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ProductCard from '@/components/ProductCard';
import URLInput from '@/components/URLInput';
import { Colors, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/productStore';

export default function HomeScreen() {
  const { products, isLoadingProducts, error, fetchProducts, setLastSearchedUrl } =
    useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleSearch(url: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Geçersiz URL', 'Lütfen geçerli bir ürün linki girin (http:// veya https://).');
      return;
    }
    setLastSearchedUrl(url);
    Alert.alert(
      'URL Alındı ✓',
      `Ürün verisi çekilecek:\n${url}\n\nBackend entegrasyonu tamamlandığında bu URL otomatik olarak işlenecektir.`,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Project Nexus</Text>
        <Text style={styles.subtitle}>Ürün linkini girerek keşfetmeye başla</Text>

        <URLInput onSubmit={handleSearch} />

        {isLoadingProducts ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>
              Backend bağlantısını kontrol edin.
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Henüz ürün yok</Text>
          </View>
        ) : (
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
                onPress={(id) => router.push({ pathname: '/product/[id]', params: { id } })}
              />
            )}
          />
        )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
});
