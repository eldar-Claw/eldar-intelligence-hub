import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';
import { Category } from '../types';

interface CategoryPillProps {
  category: Category | string;
}

const categoryLabels: Record<string, string> = {
  economy: 'כלכלה',
  politics: 'פוליטיקה',
  society: 'חברה',
  military: 'צבא וביטחון',
  technology: 'טכנולוגיה',
};

export default function CategoryPill({ category }: CategoryPillProps) {
  const color = colors.category[category] || colors.primary;
  const label = categoryLabels[category] || category;

  return (
    <View style={[styles.pill, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
