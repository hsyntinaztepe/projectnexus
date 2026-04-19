import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import ProductCard from '@/components/ProductCard';
import URLInput from '@/components/URLInput';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { products, isLoadingProducts, error, fetchProducts, setLastSearchedUrl } =
    useProductStore();
    
  // Seçili kategori state'i
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleSearch(query: string) {
    if (!query) return;

    if (query.startsWith('http://') || query.startsWith('https://')) {
      setLastSearchedUrl(query);
      Alert.alert(
        'URL Alındı ✓',
        `Ürün verisi çekilecek:\n${query}\n\nBackend entegrasyonu tamamlandığında bu URL otomatik olarak işlenecektir.`,
      );
      return;
    }

    // Normal arama yapıldıysa Ürünler sayfasında filtrele
    router.push({ pathname: '/products', params: { q: query } });
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
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>✧</Text>
        <Text style={styles.title}>Nexus</Text>
      </View>
      <Text style={styles.subtitle}>Aradığın tarz mobilyaları ve objeleri keşfet</Text>

      <URLInput onSubmit={handleSearch} />

      {/* Tanıtım Afişi */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Yeni Sezon Şok İndirimler!</Text>
          <Text style={styles.bannerSubtitle}>Odanıza en uyan akıllı ürünleri keşfedin</Text>
        </View>
      </View>

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
              <ActivityIndicator size="large" color={colors.primary} />
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

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  logoIcon: {
    fontSize: 24,
    color: colors.primary,
    marginRight: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginBottom: Spacing.lg,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  categoriesSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  bannerContainer: {
    height: 140,
    marginTop: Spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '500',
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
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
  },
});
