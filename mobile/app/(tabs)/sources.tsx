import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { Source } from '../../types';
import { getSources, updateSource, addSource, deleteSource } from '../../services/api';
import EmptyState from '../../components/EmptyState';

const SAMPLE_SOURCES: Source[] = [
  { id: 1, name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss2.xml', type: 'rss', category: 'news', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 2, name: 'הארץ', url: 'https://www.haaretz.co.il/cmlink/1.1', type: 'rss', category: 'news', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 3, name: 'כלכליסט', url: 'https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml', type: 'rss', category: 'economy', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 4, name: 'גלובס', url: 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585', type: 'rss', category: 'economy', enabled: 1, lastFetchedAt: null, errorCount: 2, status: 'error' },
  { id: 5, name: 'Geektime', url: 'https://www.geektime.co.il/feed/', type: 'rss', category: 'technology', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 6, name: 'אנשים ומחשבים', url: 'https://www.pc.co.il/feed/', type: 'rss', category: 'technology', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 7, name: 'כאן חדשות', url: 'https://www.kan.org.il/lobby/kan-news/0,7965,112,0,0.rss', type: 'rss', category: 'news', enabled: 0, lastFetchedAt: null, errorCount: 0, status: 'disabled' },
  { id: 8, name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss', category: 'technology', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 9, name: 'Reuters', url: 'https://feeds.reuters.com/reuters/worldNews', type: 'rss', category: 'news', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 10, name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', type: 'rss', category: 'news', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
  { id: 11, name: 'וואלה', url: 'https://rss.walla.co.il/feed/1', type: 'rss', category: 'news', enabled: 1, lastFetchedAt: new Date().toISOString(), errorCount: 0, status: 'active' },
];

const statusColors: Record<string, string> = {
  active: colors.success,
  error: colors.danger,
  disabled: colors.textLight,
};

const categoryLabels: Record<string, string> = {
  news: 'חדשות',
  economy: 'כלכלה',
  technology: 'טכנולוגיה',
  politics: 'פוליטיקה',
  society: 'חברה',
  military: 'צבא וביטחון',
};

export default function SourcesScreen() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('news');

  const loadSources = useCallback(async () => {
    try {
      const data = await getSources();
      setSources(data.length > 0 ? data : SAMPLE_SOURCES);
    } catch {
      setSources(SAMPLE_SOURCES);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSources();
    setRefreshing(false);
  }, [loadSources]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleToggle = async (source: Source) => {
    const updated = { ...source, enabled: source.enabled ? 0 : 1, status: source.enabled ? 'disabled' as const : 'active' as const };
    setSources((prev) => prev.map((s) => (s.id === source.id ? updated : s)));
    try {
      await updateSource(source.id, { enabled: updated.enabled });
    } catch {
      // Revert on error
      setSources((prev) => prev.map((s) => (s.id === source.id ? source : s)));
    }
  };

  const handleDelete = (source: Source) => {
    Alert.alert('מחיקת מקור', `למחוק את "${source.name}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          setSources((prev) => prev.filter((s) => s.id !== source.id));
          try {
            await deleteSource(source.id);
          } catch {}
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!newName || !newUrl) return;
    const newSource: Source = {
      id: Date.now(),
      name: newName,
      url: newUrl,
      type: 'rss',
      category: newCategory,
      enabled: 1,
      lastFetchedAt: null,
      errorCount: 0,
      status: 'active',
    };
    setSources((prev) => [newSource, ...prev]);
    setModalVisible(false);
    setNewName('');
    setNewUrl('');
    try {
      await addSource({ name: newName, url: newUrl, type: 'rss', category: newCategory });
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Source }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] || colors.textLight }]} />
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Switch
          value={!!item.enabled}
          onValueChange={() => handleToggle(item)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={item.enabled ? colors.primary : colors.textLight}
        />
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabels[item.category] || item.category}</Text>
        </View>
        <Text style={styles.type}>{item.type.toUpperCase()}</Text>
      </View>
      {item.lastFetchedAt && (
        <Text style={styles.lastFetch}>
          עדכון אחרון: {new Date(item.lastFetchedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
      {item.errorCount > 0 && (
        <Text style={styles.errorText}>⚠️ {item.errorCount} שגיאות</Text>
      )}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}>הוסף מקור</Text>
      </TouchableOpacity>

      <FlatList
        data={sources}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Source Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>הוספת מקור חדש</Text>
            <TextInput
              style={styles.input}
              placeholder="שם המקור"
              placeholderTextColor={colors.textLight}
              value={newName}
              onChangeText={setNewName}
              textAlign="right"
            />
            <TextInput
              style={styles.input}
              placeholder="כתובת RSS / URL"
              placeholderTextColor={colors.textLight}
              value={newUrl}
              onChangeText={setNewUrl}
              textAlign="left"
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleAdd}>
                <Text style={styles.modalSaveText}>הוסף</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  list: { padding: spacing.md, paddingTop: spacing.sm },
  addButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.md,
  },
  addButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: '600', marginRight: spacing.sm },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: spacing.sm },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, writingDirection: 'rtl' },
  cardMeta: { flexDirection: 'row-reverse', marginTop: spacing.sm, alignItems: 'center' },
  categoryBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 8 },
  categoryText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  type: { fontSize: fontSize.xs, color: colors.textLight, marginRight: spacing.sm },
  lastFetch: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  errorText: { fontSize: fontSize.xs, color: colors.danger, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  deleteBtn: { position: 'absolute', bottom: spacing.md, left: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modal: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primaryDark, textAlign: 'right', marginBottom: spacing.lg, writingDirection: 'rtl' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    writingDirection: 'rtl',
  },
  modalButtons: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: spacing.sm },
  modalCancel: { padding: spacing.sm + 4, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, flex: 1, marginLeft: spacing.sm },
  modalCancelText: { textAlign: 'center', color: colors.textSecondary, fontWeight: '600', fontSize: fontSize.md },
  modalSave: { padding: spacing.sm + 4, borderRadius: borderRadius.md, backgroundColor: colors.primary, flex: 1, marginRight: spacing.sm },
  modalSaveText: { textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: fontSize.md },
});
