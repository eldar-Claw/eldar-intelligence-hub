import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  icon?: string;
  count?: number;
}

export default function SectionHeader({ title, icon, count }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {count !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: fontSize.lg,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primaryDark,
    writingDirection: 'rtl',
    textAlign: 'right',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  line: {
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
