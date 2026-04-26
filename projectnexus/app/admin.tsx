import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { adminAPI, type AffiliateClick, type AffiliateStats } from '@/services/api';

// ─── Veri Yardımcıları ────────────────────────────────────────────────────────

interface DayData {
  label: string;
  shortLabel: string;
  count: number;
}

const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function getDailyData(clicks: AffiliateClick[]): DayData[] {
  const result: DayData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = clicks.filter((c) => c.clicked_at.startsWith(key)).length;
    result.push({
      label: i === 0 ? 'Bugün' : TR_DAYS[d.getDay()],
      shortLabel: i === 0 ? 'Bug.' : TR_DAYS[d.getDay()],
      count,
    });
  }
  return result;
}

function getTodayCount(clicks: AffiliateClick[]) {
  const today = new Date().toISOString().split('T')[0];
  return clicks.filter((c) => c.clicked_at.startsWith(today)).length;
}

function getYesterdayCount(clicks: AffiliateClick[]) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];
  return clicks.filter((c) => c.clicked_at.startsWith(yesterday)).length;
}

// ─── Bar Chart Bileşeni ───────────────────────────────────────────────────────

const BAR_AREA_HEIGHT = 130;
const Y_LINES = 4;

function DailyBarChart({ data, primaryColor }: { data: DayData[]; primaryColor: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const anims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      55,
      anims.map((anim) =>
        Animated.spring(anim, { toValue: 1, useNativeDriver: false, bounciness: 6 })
      )
    ).start();
  }, []);

  const yLabels = Array.from({ length: Y_LINES + 1 }, (_, i) =>
    Math.round((max / Y_LINES) * (Y_LINES - i))
  );

  return (
    <View style={{ marginTop: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        {/* Y Ekseni etiketleri */}
        <View style={{ width: 28, height: BAR_AREA_HEIGHT, justifyContent: 'space-between', paddingBottom: 2 }}>
          {yLabels.map((v, i) => (
            <Text key={i} style={{ fontSize: 9, color: '#666', textAlign: 'right' }}>
              {v}
            </Text>
          ))}
        </View>

        {/* Grafik alanı */}
        <View style={{ flex: 1, marginLeft: 4 }}>
          {/* Yatay kılavuz çizgileri */}
          <View style={[StyleSheet.absoluteFill, { justifyContent: 'space-between', paddingBottom: 2 }]}>
            {yLabels.map((_, i) => (
              <View key={i} style={{ height: 1, backgroundColor: 'rgba(128,128,128,0.15)' }} />
            ))}
          </View>

          {/* Barlar */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_AREA_HEIGHT, gap: 5 }}>
            {data.map((item, i) => {
              const isToday = i === data.length - 1;
              const targetH = Math.max((item.count / max) * (BAR_AREA_HEIGHT - 18), 3);
              const barH = anims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [3, targetH],
              });
              const opacity = anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: BAR_AREA_HEIGHT }}>
                  {/* Değer etiketi */}
                  <Animated.Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: isToday ? primaryColor : '#888',
                      marginBottom: 3,
                      opacity,
                    }}
                  >
                    {item.count > 0 ? item.count : ''}
                  </Animated.Text>

                  {/* Bar */}
                  <Animated.View
                    style={{
                      width: '100%',
                      height: barH,
                      backgroundColor: isToday ? primaryColor : primaryColor + '66',
                      borderRadius: 5,
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X Ekseni etiketleri */}
      <View style={{ flexDirection: 'row', marginLeft: 32, marginTop: 6, gap: 5 }}>
        {data.map((item, i) => {
          const isToday = i === data.length - 1;
          return (
            <Text
              key={i}
              style={{
                flex: 1,
                fontSize: 10,
                textAlign: 'center',
                color: isToday ? primaryColor : '#666',
                fontWeight: isToday ? '700' : '400',
              }}
            >
              {item.shortLabel}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// ─── Platform Yatay Bar Bileşeni ──────────────────────────────────────────────

function PlatformBar({
  platform,
  count,
  total,
  color,
  textColor,
}: {
  platform: string;
  count: number;
  total: number;
  color: string;
  textColor: string;
}) {
  const pct = total > 0 ? count / total : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, bounciness: 2 }).start();
  }, [pct]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
          <Text style={{ fontSize: 13, color: textColor, fontWeight: '600' }}>{platform}</Text>
        </View>
        <Text style={{ fontSize: 13, color: textColor, fontWeight: '700' }}>
          {count} <Text style={{ fontWeight: '400', color: '#888' }}>({Math.round(pct * 100)}%)</Text>
        </Text>
      </View>
      <View style={{ height: 10, backgroundColor: color + '25', borderRadius: 5, overflow: 'hidden' }}>
        <Animated.View
          style={{ height: '100%', width, backgroundColor: color, borderRadius: 5 }}
        />
      </View>
    </View>
  );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Veriler yüklenemedi.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  function onRefresh() {
    setRefreshing(true);
    loadStats();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function platformColor(platform: string | null) {
    const map: Record<string, string> = {
      Amazon: '#FF9900',
      IKEA: '#0058A3',
      Trendyol: '#F27A1A',
      DummyJSON: '#6C63FF',
    };
    return map[platform ?? ''] ?? '#888888';
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

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allClicks = stats?.recent_clicks ?? [];
  const dailyData = getDailyData(allClicks);
  const todayCount = getTodayCount(allClicks);
  const yesterdayCount = getYesterdayCount(allClicks);
  const diff = todayCount - yesterdayCount;

  const renderClick = ({ item }: { item: AffiliateClick }) => (
    <View style={styles.clickRow}>
      <View style={[styles.platformDot, { backgroundColor: platformColor(item.platform) }]} />
      <View style={styles.clickInfo}>
        <Text style={styles.clickName} numberOfLines={1}>{item.product_name}</Text>
        <Text style={styles.clickMeta}>
          {item.platform ?? 'Bilinmiyor'} · {formatDate(item.clicked_at)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={allClicks}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.pageTitle}>Affiliate Panel</Text>
            <Text style={styles.pageSubtitle}>Satın Al tıklamaları · son 100 kayıt</Text>

            {/* Özet Kartlar */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{stats?.total_clicks ?? 0}</Text>
                <Text style={styles.summaryLabel}>Toplam</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{todayCount}</Text>
                <Text style={styles.summaryLabel}>Bugün</Text>
              </View>
              <View style={styles.summaryCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.summaryValue}>{yesterdayCount}</Text>
                  {diff !== 0 && (
                    <Text style={{ fontSize: 12, color: diff > 0 ? '#4CAF50' : '#F44336', fontWeight: '700' }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </Text>
                  )}
                </View>
                <Text style={styles.summaryLabel}>Dün</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{Object.keys(stats?.by_platform ?? {}).length}</Text>
                <Text style={styles.summaryLabel}>Platform</Text>
              </View>
            </View>

            {/* 7 Günlük Trend Grafiği */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Son 7 Günlük Tıklamalar</Text>
              <DailyBarChart data={dailyData} primaryColor={colors.primary} />
            </View>

            {/* Platform Dağılımı */}
            {stats && Object.keys(stats.by_platform).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Platform Dağılımı</Text>
                {Object.entries(stats.by_platform)
                  .sort(([, a], [, b]) => b - a)
                  .map(([platform, count]) => (
                    <PlatformBar
                      key={platform}
                      platform={platform}
                      count={count}
                      total={stats.total_clicks}
                      color={platformColor(platform)}
                      textColor={colors.text}
                    />
                  ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Son Tıklamalar</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Henüz hiç tıklama yok.</Text>
          </View>
        }
        renderItem={renderClick}
      />
    </SafeAreaView>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.text, fontSize: 15, textAlign: 'center', padding: Spacing.lg },
  listContent: { padding: Spacing.md, paddingBottom: 60 },

  pageTitle: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: Spacing.lg },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.sm,
  },

  platformDot: { width: 10, height: 10, borderRadius: 5 },

  clickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  clickInfo: { flex: 1 },
  clickName: { fontSize: 14, fontWeight: '600', color: colors.text },
  clickMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
