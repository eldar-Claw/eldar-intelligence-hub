import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { Trend } from '../types';

interface TrendCardProps {
  trend: Trend;
}

function getDirectionIcon(direction: Trend['direction']): {
  name: 'trending-up' | 'trending-down' | 'remove-outline';
  color: string;
} {
  switch (direction) {
    case 'up':
      return { name: 'trending-up', color: colors.success };
    case 'down':
      return { name: 'trending-down', color: colors.danger };
    case 'stable':
      return { name: 'remove-outline', color: colors.warning };
  }
}

const directionLabels: Record<string, string> = {
  up: 'מגמת עלייה',
  down: 'מגמת ירידה',
  stable: 'יציב',
};

export default function TrendCard({ trend }: TrendCardProps) {
  const icon = getDirectionIcon(trend.direction);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.title}>{trend.title}</Text>
          <Text style={[styles.direction, { color: icon.color }]}>
            {directionLabels[trend.direction]}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{trend.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  direction: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
    writingDirection: 'rtl',
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
});
