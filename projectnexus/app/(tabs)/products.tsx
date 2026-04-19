import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ProductCard from '@/components/ProductCard';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';

export default function ProductsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { products, fetchProducts, isLoadingProducts } = useProductStore();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [sortOption, setSortOption] = useState<'A-Z' | 'Z-A' | 'Fiyat: Artan' | 'Fiyat: Azalan'>('A-Z');

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      setActiveCategory('Tümü');
    }
  }, [q]);

  const categories = useMemo(() => {
    return ['Tümü', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // 1. Kategori Filtresi
    if (activeCategory !== 'Tümü') {
      result = result.filter(p => p.category === activeCategory);
    }

    // 2. Arama Filtresi
    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 3. Sıralama
    result = [...result].sort((a, b) => {
      // price değerinin sayı olduğundan ve null/undefined olmadığından emin olalım
      const priceA = a.price || 0;
      const priceB = b.price || 0;

      if (sortOption === 'A-Z') return a.name.localeCompare(b.name);
      if (sortOption === 'Z-A') return b.name.localeCompare(a.name);
      if (sortOption === 'Fiyat: Artan') return priceA - priceB;
      if (sortOption === 'Fiyat: Azalan') return priceB - priceA;
      return 0;
    });

    return result;
  }, [products, activeCategory, searchQuery, sortOption]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.screenTitle}>Tüm Ürünler</Text>
      
      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Arama..." placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✖</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Kategori Filtresi */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item as string}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(item as string)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === item && styles.categoryTextActive
              ]}>
                {item as string}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sıralama ve Sonuç Sayısı */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{filteredAndSortedProducts.length} ürün</Text>
        <View style={styles.sortButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.sortButton, 
              (sortOption === 'A-Z' || sortOption === 'Z-A') && styles.sortButtonActive
            ]}
            onPress={() => setSortOption(prev => prev === 'A-Z' ? 'Z-A' : 'A-Z')}
          >
            <Text style={[
              styles.sortText, 
              (sortOption === 'A-Z' || sortOption === 'Z-A') && styles.sortTextActive
            ]}>
              İsim ({sortOption === 'Z-A' ? 'Z-A' : 'A-Z'})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.sortButton, 
              (sortOption === 'Fiyat: Artan' || sortOption === 'Fiyat: Azalan') && styles.sortButtonActive
            ]}
            onPress={() => setSortOption(prev => prev === 'Fiyat: Artan' ? 'Fiyat: Azalan' : 'Fiyat: Artan')}
          >
            <Text style={[
              styles.sortText, 
              (sortOption === 'Fiyat: Artan' || sortOption === 'Fiyat: Azalan') && styles.sortTextActive
            ]}>
              Fiyat ({sortOption === 'Fiyat: Azalan' ? 'Azalan' : 'Artan'})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoadingProducts && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={renderHeader}
            data={filteredAndSortedProducts}
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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>Aradığınız kriterlere uygun ürün bulunamadı.</Text>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCategory('Tümü');
                  }}
                >
                  <Text style={styles.resetButtonText}>Filtreleri Temizle</Text>
                </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: colors.background,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.sm,
    height: 48,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    padding: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 16,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  statsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sortTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
