import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, borderRadius } from '../constants/theme';

interface ImportanceBadgeProps {
  importance: number;
  size?: 'sm' | 'md';
}

function getImportanceColor(importance: number): string {
  if (importance >= 8) return colors.importance.high;
  if (importance >= 5) return colors.importance.medium;
  return colors.importance.low;
}

export default function ImportanceBadge({ importance, size = 'md' }: ImportanceBadgeProps) {
  const color = getImportanceColor(importance);
  const badgeSize = size === 'sm' ? 24 : 32;
  const textSize = size === 'sm' ? fontSize.xs : fontSize.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '18',
          borderColor: color,
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: textSize }]}>
        {importance}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '700',
  },
});
