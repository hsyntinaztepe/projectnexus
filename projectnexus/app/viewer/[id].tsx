import { useLocalSearchParams, Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ModelViewer from '@/components/ModelViewer';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import api, { productsAPI } from '@/services/api';

const LOCAL_MODEL = require('@/assets/models/Koltuk.glb');

/**
 * DB'de saklanan model_url içindeki origin'i (IP:PORT),
 * axios'un kullandığı gerçek baseURL ile değiştirir.
 * Örnek: http://192.168.0.4:8000/media/... → http://10.0.2.2:8000/media/...
 */
function resolveModelUrl(rawUrl: string): string {
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  try {
    const u = new URL(rawUrl);
    return base + u.pathname;
  } catch {
    return rawUrl;
  }
}

export default function ViewerScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductStore((state) => state.getProductById(id));
  const { isAuthenticated } = useAuthStore();

  const [isDesignModalVisible, setDesignModalVisible] = useState(false);
  const [designPrompt, setDesignPrompt] = useState('');
  
  // Custom design states
  const [isGenerating, setIsGenerating] = useState(false);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string>('');

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Model bulunamadı</Text>
          <Text style={styles.subtitle}>Geçerli bir ürün seçip tekrar dene.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const modelSource = customModelUrl 
    ? resolveModelUrl(customModelUrl) 
    : (product.model_url && product.model_url.startsWith('http')
        ? resolveModelUrl(product.model_url)
        : LOCAL_MODEL);

  async function handleSendDesign() {
    if (!isAuthenticated) {
      Alert.alert("Hata", "Tasarım yapabilmek için giriş yapmalısınız.");
      return;
    }

    if (!designPrompt.trim()) {
      Alert.alert("Hata", "Lütfen bir tasarım beklentisi yazın.");
      return;
    }
    
    setDesignModalVisible(false);
    setIsGenerating(true);
    
    try {
      const response = await productsAPI.generateCustomDesign(product!.id, designPrompt);
      setCustomModelUrl(response.data.model_url);
      setActivePrompt(response.data.refined_prompt || designPrompt);
      Alert.alert("Başarılı", "Model üretildi ve sahneye yüklendi!");
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Üretim sırasında bir sorun oluştu.");
    } finally {
      setIsGenerating(false);
      setDesignPrompt('');
    }
  }

  async function handleSaveDesign() {
    if (!customModelUrl) return;
    try {
      await productsAPI.saveCustomDesign(product!.id, customModelUrl, activePrompt);
      Alert.alert("Kaydedildi", "Özel tasarımınız hesabınıza kaydedildi.");
    } catch (error) {
      Alert.alert("Hata", "Tasarım kaydedilirken bir hata oluştu.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: customModelUrl ? 'Özel Tasarımınız' : '3D Görüntüleyici',
          headerRight: () => (
            <TouchableOpacity onPress={() => setDesignModalVisible(true)} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>Tasarla 🪄</Text>
            </TouchableOpacity>
          )
        }} 
      />

      <View style={styles.container}>
        <Text style={styles.title}>{customModelUrl ? 'Sizin Tasarımınız' : product.name}</Text>
        <Text style={styles.subtitle}>
          {customModelUrl ? 'Tasarımınız hazır! Parmakla döndür ve yakınlaştır.' : 'Parmakla döndür ve yakınlaştır.'}
        </Text>
        
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingEmoji}>⏳</Text>
            <Text style={styles.loadingText}>Yapay zeka modelinizi oluşturuyor...</Text>
            <Text style={styles.loadingSubtext}>Bu işlem birkaç dakika sürebilir, lütfen bekleyin.</Text>
          </View>
        ) : (
          <ModelViewer modelSource={modelSource} />
        )}

        {customModelUrl && !isGenerating && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDesign}>
            <Text style={styles.saveBtnText}>💾 Bu Tasarımı Kaydet</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tasarım Modal */}
      <Modal visible={isDesignModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modeli Tasarla</Text>
            <Text style={styles.modalSubtitle}>Bu modelde yapılmasını istediğiniz değişiklikleri veya beklentilerinizi yazın.</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Örn: Rengini daha açık bir mavi yapıp, ayak kısımlarını ahşap yapabilir misin?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={designPrompt}
              onChangeText={setDesignPrompt}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDesignModalVisible(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendDesign}>
                <Text style={styles.sendBtnText}>Gönder</Text>
              </TouchableOpacity>
            </View>
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
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  headerBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  headerBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
  },
  textInput: {
    backgroundColor: colors.background,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  loadingSubtext: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
