import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { NewsItem } from '../types';
import ImportanceBadge from './ImportanceBadge';
import CategoryPill from './CategoryPill';

interface ReportCardProps {
  item: NewsItem;
}

export default function ReportCard({ item }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleOpenSource = () => {
    if (item.sourceUrl) {
      Linking.openURL(item.sourceUrl);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <ImportanceBadge importance={item.importance} />
          <View style={styles.titleArea}>
            <Text style={styles.title} numberOfLines={expanded ? undefined : 2}>
              {item.title}
            </Text>
            <View style={styles.meta}>
              <CategoryPill category={item.category} />
              <Text style={styles.source}>{item.sourceName}</Text>
            </View>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textLight}
        />
      </View>

      {!expanded && (
        <Text style={styles.summary} numberOfLines={2}>
          {item.summary}
        </Text>
      )}

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>תקציר</Text>
            <Text style={styles.sectionText}>{item.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>למה זה חשוב</Text>
            <Text style={styles.sectionText}>{item.whyItMatters}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>השלכות</Text>
            <Text style={styles.sectionText}>{item.implications}</Text>
          </View>

          {item.sourceUrl ? (
            <TouchableOpacity style={styles.sourceLink} onPress={handleOpenSource}>
              <Ionicons name="open-outline" size={14} color={colors.primary} />
              <Text style={styles.sourceLinkText}>פתח מקור</Text>
            </TouchableOpacity>
          ) : null}

          {item.authorName ? (
            <Text style={styles.author}>מאת: {item.authorName}</Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
  meta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  source: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    writingDirection: 'rtl',
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'right',
    lineHeight: 20,
    writingDirection: 'rtl',
  },
  expandedContent: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'right',
    marginBottom: spacing.xs,
    writingDirection: 'rtl',
  },
  sectionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
    writingDirection: 'rtl',
  },
  sourceLink: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  sourceLinkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  author: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
    writingDirection: 'rtl',
  },
});
