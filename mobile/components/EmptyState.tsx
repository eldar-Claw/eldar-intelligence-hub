import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = 'document-text-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textLight} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
