import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface ExecutiveSummaryProps {
  summary: string;
  date: string;
}

function formatHebrewDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return dateStr;
  }
}

export default function ExecutiveSummary({ summary, date }: ExecutiveSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.gradientWrapper}>
        <View style={styles.gradient}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={22} color="rgba(255,255,255,0.9)" />
            <View style={styles.headerText}>
              <Text style={styles.title}>תקציר מנהלים</Text>
              <Text style={styles.date}>{formatHebrewDate(date)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  gradientWrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    backgroundColor: colors.primaryDark,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  date: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
    marginTop: 2,
    writingDirection: 'rtl',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.md,
  },
  summaryText: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'right',
    lineHeight: 26,
    writingDirection: 'rtl',
  },
});
