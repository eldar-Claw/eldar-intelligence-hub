import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { Report } from '../../types';
import { getReports } from '../../services/api';
import EmptyState from '../../components/EmptyState';

const SAMPLE_REPORTS: Report[] = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    executiveSummary: 'היום חלו התפתחויות משמעותיות בזירה הכלכלית והביטחונית.',
    trends: '[]',
    conclusion: '',
    watchNext24h: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    executiveSummary: 'שוק ההון הישראלי סיים יום חיובי עם עליות בכל המדדים.',
    trends: '[]',
    conclusion: '',
    watchNext24h: '',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    executiveSummary: 'ישיבת ממשלה חירום בנושא רפורמת הדיור ופעולות בגזרת הצפון.',
    trends: '[]',
    conclusion: '',
    watchNext24h: '',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

function formatHebrewDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  return `יום ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function HistoryScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const data = await getReports(1, 30);
      setReports(data.data.length > 0 ? data.data : SAMPLE_REPORTS);
    } catch {
      setReports(SAMPLE_REPORTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }, [loadReports]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon="time-outline"
        title="אין היסטוריה"
        message="עדיין לא נוצרו דוחות. דוחות חדשים יופיעו כאן."
      />
    );
  }

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.date}>{formatHebrewDate(item.date)}</Text>
        </View>
        <Ionicons name="chevron-back" size={20} color={colors.textLight} />
      </View>
      <Text style={styles.summary} numberOfLines={3}>
        {item.executiveSummary}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>
          {item.newsItems?.length || '—'} פריטים
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  date: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.xs,
    writingDirection: 'rtl',
  },
  summary: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row-reverse',
  },
  itemCount: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    writingDirection: 'rtl',
  },
});
