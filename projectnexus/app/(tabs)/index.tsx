import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import ProductCard from '@/components/ProductCard';
import URLInput from '@/components/URLInput';
import { Colors, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/productStore';

export default function HomeScreen() {
  const { products, isLoadingProducts, error, fetchProducts, setLastSearchedUrl } =
    useProductStore();
    
  // Seçili kategori state'i
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');

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

  // Dinamik olarak ürünlerden kategorileri çıkartıyoruz
  const categories = ['Tümü', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Aktif kategoriye göre filtrele
  const filteredProducts = activeCategory === 'Tümü' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Sadece ilk 10 ürünü öne çıkanlar olarak göster
  const featuredProducts = filteredProducts.slice(0, 10);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Project Nexus</Text>
      <Text style={styles.subtitle}>Ürün linkini girerek keşfetmeye başla</Text>

      <URLInput onSubmit={handleSearch} />

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive
              ]}
              onPress={() => setActiveCategory(cat as string)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat && styles.categoryTextActive
              ]}>
                {cat as string}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoadingProducts && products.length === 0 ? (
          <>
            {renderHeader()}
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
            </View>
          </>
        ) : error ? (
          <>
            {renderHeader()}
            <View style={styles.centered}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorSubtext}>Backend bağlantısını kontrol edin.</Text>
            </View>
          </>
        ) : (
          <FlatList
            ListHeaderComponent={renderHeader}
            data={featuredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={(id) => router.push({ pathname: '/product/[id]', params: { id } })}
              />
            )}
            ListEmptyComponent={
              <View style={styles.centeredEmpty}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Bu kategoride ürün yok</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  categoriesSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  centeredEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
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
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
