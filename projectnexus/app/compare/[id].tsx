import { useLocalSearchParams, router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
} from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';
import { productsAPI, type Product } from '@/services/api';

export default function CompareProducts() {
  const { colors } = useTheme();
  let styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [product1, setProduct1] = useState<Product | null>(null);
  const [product2, setProduct2] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const stored = useProductStore.getState().getProductById(id);
        if (stored) {
          setProduct1(stored);
        } else {
          const response = await productsAPI.getById(id);
          setProduct1(response.data);
        }

        // Fetch all products for selector
        const allRes = await productsAPI.list({ limit: 100 });
        setAllProducts(allRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  function ProductColumn({ product, isRight }: { product: Product | null, isRight: boolean }) {
    if (!product && isRight) {
      return (
        <View style={styles.column}>
           <TouchableOpacity style={styles.selectProductBtn} onPress={() => setModalVisible(true)}>
             <Text style={styles.selectProductIcon}>➕</Text>
             <Text style={styles.selectProductText}>Ürün Seç</Text>
           </TouchableOpacity>
        </View>
      );
    }
    if (!product) return <View style={styles.column}><ActivityIndicator /></View>;

    return (
      <View style={styles.column}>
        {isRight && (
          <TouchableOpacity style={styles.changeProductBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.changeProductText}>Değiştir</Text>
          </TouchableOpacity>
        )}
        <Image
          source={{ uri: product.image_url || 'https://via.placeholder.com/300' }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price != null ? `${product.price.toLocaleString('tr-TR')} TL` : 'Fiyat Yok'}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kategori</Text>
          <Text style={styles.detailValue}>{product.category || '-'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Boyutlar</Text>
          <Text style={styles.detailValue}>
            {product.dimensions 
              ? `${product.dimensions.width}×${product.dimensions.height}×${product.dimensions.depth} cm` 
              : '-'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Platform</Text>
          <Text style={styles.detailValue}>{product.platform || '-'}</Text>
        </View>

        {product.colors && product.colors.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Renk Sayısı</Text>
            <Text style={styles.detailValue}>{product.colors.length}</Text>
          </View>
        )}
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Karşılaştırma' }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.compareContainer}>
          <ProductColumn product={product1} isRight={false} />
          <View style={styles.divider} />
          <ProductColumn product={product2} isRight={true} />
        </View>
      </ScrollView>

      {/* 3D Karşılaştır Butonu */}
      {product1 && product2 && (
        <View style={styles.bottomActionContainer}>
          <TouchableOpacity 
            style={styles.compare3DBtn} 
            onPress={() => router.push({ pathname: '/compare-viewer', params: { id1: product1.id, id2: product2.id } })}
          >
            <Text style={styles.compare3DBtnText}>🔮 3D Karşılaştır</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Selection Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Karşılaştırılacak Ürünü Seç</Text>
            <FlatList
              data={allProducts.filter(p => p.id !== product1?.id)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setProduct2(item);
                    setModalVisible(false);
                  }}
                >
                  <Image source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} style={styles.modalItemImage} />
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemPrice}>{item.price ? `${item.price} TL` : ''}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 16,
    color: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
  },
  column: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: Spacing.xs,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: Spacing.md,
  },
  detailRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectProductBtn: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 8,
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  selectProductIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  selectProductText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  changeProductBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  changeProductText: {
    fontSize: 12,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  modalItemPrice: {
    fontSize: 13,
    color: colors.accent,
    marginTop: 4,
  },
  closeModalBtn: {
    marginTop: Spacing.md,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomActionContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  compare3DBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  compare3DBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
