import { useState, useEffect, useRef } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/hooks/useTheme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { favorites, products, lastSearchedUrl, setLastSearchedUrl } = useProductStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const sysThemeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  
  // Bildirim durumu için basit bir state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Özel Bildirim Gösterme Fonksiyonu
  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 50,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(''));
  };

  // 1. Çıkış Yap İşlemi
  async function handleLogout() {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan güvenli bir şekilde çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Başarılı', 'Hesabınızdan çıkış yapıldı.');
          },
        },
      ],
    );
  }

  // 2. Bildirimler İşlemi
  async function handleNotifications() {
    Alert.alert(
      'Bildirim Tercihleri',
      notificationsEnabled 
        ? 'Şu anda bildirimleri alıyorsunuz. Kapatmak ister misiniz?' 
        : 'İndirimler ve yeni ürünler hakkında bildirim almak ister misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: notificationsEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç', 
          style: notificationsEnabled ? 'destructive' : 'default',
          onPress: async () => {
            const willEnable = !notificationsEnabled;
            
            if (willEnable) {
              setNotificationsEnabled(true);
              showToast("🔔 Bildirimler başarıyla açıldı! Artık indirimleri kaçırmayacaksın.");
            } else {
              setNotificationsEnabled(false);
              showToast("🔕 Bildirimler sessize alındı.");
            }
          } 
        }
      ]
    );
  }

  // 3. Ayarlar İşlemi
  function handleSettings() {
    Alert.alert(
      'Görünüm ve Tercihler',
      `Şu anki mod: ${sysThemeMode}\nUygulama temasını yapılandırın:`,
      [
        { text: 'Açık Tema', onPress: () => { setTheme('light'); showToast('Açık Tema Aktif'); } },
        { text: 'Koyu Tema', onPress: () => { setTheme('dark'); showToast('Koyu Tema Aktif'); } },
        { text: 'Sistem Teması', onPress: () => { setTheme('system'); showToast('Sistem Teması Aktif'); } },
        { text: 'Vazgeç', style: 'cancel' }
      ]
    );
  }

  // 4. Arama Geçmişi İşlemi
  function handleHistory() {
    if (!lastSearchedUrl) {
      Alert.alert('Arama Geçmişi', 'Şu zamana kadar hiçbir ürün aratmadınız. Biraz vitrine göz atmaya ne dersiniz?');
      return;
    }
    Alert.alert(
      'Son Yapılan Arama',
      `Arama Metni/URL: \n${lastSearchedUrl}`,
      [
        { 
          text: 'Geçmişi Temizle', 
          style: 'destructive', 
          onPress: () => {
            setLastSearchedUrl(''); // Store üzerinden geçmişi temizleme yetkisi (store'da tanımlıysa)
            Alert.alert('Temizlendi', 'Arama geçmişiniz başarıyla silindi.');
          } 
        },
        { 
          text: 'Tekrar Ara', 
          style: 'default',
          onPress: () => router.push('/(tabs)') // Kullanıcıyı arama ekranına geri at
        },
        { text: 'Kapat', style: 'cancel' }
      ]
    );
  }

  // 5. Hakkında İşlemi
  function handleAbout() {
    Alert.alert(
      'Hakkında',
      'Project Nexus v1.0.0\n\nGeliştirici: Nexus Ekibi\n© 2026 Tüm Hakları Saklıdır.\n\nEviniz için en iyi mobilya ve dekorasyon ürünlerini zeka destekli altyapımızla sunuyoruz.',
      [
        { 
          text: 'Web Sitemizi Ziyaret Et', 
          onPress: () => Linking.openURL('https://github.com').catch(() => Alert.alert('Hata', 'Web sitesi açılamadı.'))
        },
        { text: 'Tamam', style: 'cancel' }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.customToast, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {isAuthenticated && user ? '😊' : '👤'}
            </Text>
          </View>
          <Text style={styles.username}>
            {isAuthenticated && user ? (user.full_name || user.username) : 'Misafir Kullanıcı'}
          </Text>
          <Text style={styles.email}>
            {isAuthenticated && user ? user.email : 'Giriş yapılmadı'}
          </Text>
        </View>

        {/* Giriş/Kayıt Butonu (Misafir ise) */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>Giriş Yap / Kayıt Ol</Text>
          </TouchableOpacity>
        )}

        {/* İstatistikler */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Ürün</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lastSearchedUrl ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Arama</Text>
          </View>
        </View>

        {/* Menü */}
        <View style={styles.menu}>
          {isAuthenticated && user?.email === 'admin@demo.com' && (
            <TouchableOpacity
              style={[styles.menuItem, styles.adminMenuItem]}
              onPress={() => router.push('/admin')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={[styles.menuText, styles.adminMenuText]}>Admin Paneli</Text>
              <Text style={styles.adminBadge}>ADMIN</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Bildirimler</Text>
            <Text style={styles.menuStatus}>{notificationsEnabled ? 'Açık' : 'Kapalı'}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Ayarlar</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleHistory}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>Arama Geçmişi</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuText}>Hakkında</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          {isAuthenticated && (
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuText, { color: '#E53935' }]}>Çıkış Yap</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.version}>Project Nexus v1.0.0</Text>
      </View>
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
    backgroundColor: colors.background,
  },
  customToast: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: 36,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  menu: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  menuStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  menuChevron: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  adminMenuItem: {
    backgroundColor: colors.primary + '15',
  },
  adminMenuText: {
    color: colors.primary,
    fontWeight: '700',
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    overflow: 'hidden',
  },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 'auto',
    paddingBottom: Spacing.md,
  },
});
