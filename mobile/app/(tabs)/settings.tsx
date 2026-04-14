import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { getSettings, updateSettings, checkConnection } from '../../services/api';
import { getBackendUrl, setBackendUrl } from '../../services/storage';

export default function SettingsScreen() {
  const [email, setEmail] = useState('eldar@el-dar.co.il');
  const [scheduleTime, setScheduleTime] = useState('07:00');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [backendUrl, setBackendUrlState] = useState('http://localhost:3001');
  const [connected, setConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [newsCount, setNewsCount] = useState('10');
  const [contentCount, setContentCount] = useState('5');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await getBackendUrl();
      setBackendUrlState(url);
      const settings = await getSettings();
      if (settings.email) setEmail(settings.email);
      if (settings.scheduleTime) setScheduleTime(settings.scheduleTime);
      if (settings.apiKey) setApiKey(settings.apiKey);
      if (settings.newsCount) setNewsCount(settings.newsCount);
      if (settings.contentCount) setContentCount(settings.contentCount);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  };

  const handleSave = async () => {
    try {
      await setBackendUrl(backendUrl);
      await updateSettings({
        email,
        scheduleTime,
        apiKey,
        newsCount,
        contentCount,
      });
      Alert.alert('נשמר', 'ההגדרות נשמרו בהצלחה ✅');
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לשמור הגדרות. בדוק את החיבור לשרת.');
    }
  };

  const handleTestConnection = async () => {
    await setBackendUrl(backendUrl);
    const ok = await checkConnection();
    setConnected(ok);
    Alert.alert(ok ? 'מחובר ✅' : 'לא מחובר ❌', ok ? 'החיבור לשרת תקין.' : 'לא ניתן להתחבר לשרת. בדוק את הכתובת.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Connection Status */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: connected ? colors.success : colors.danger }]} />
        <Text style={styles.statusText}>{connected ? 'מחובר לשרת' : 'לא מחובר'}</Text>
      </View>

      {/* Server Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖥️ שרת</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>כתובת Backend</Text>
          <TextInput
            style={styles.input}
            value={backendUrl}
            onChangeText={setBackendUrlState}
            placeholder="http://localhost:3001"
            placeholderTextColor={colors.textLight}
            textAlign="left"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <TouchableOpacity style={styles.testButton} onPress={handleTestConnection}>
          <Ionicons name="wifi-outline" size={16} color={colors.primary} />
          <Text style={styles.testButtonText}>בדוק חיבור</Text>
        </TouchableOpacity>
      </View>

      {/* Email Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 דוא"ל</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>כתובת מייל לשליחת דוח</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.textLight}
            textAlign="left"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ תזמון</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>שעת שליחת דוח יומי</Text>
          <TextInput
            style={styles.input}
            value={scheduleTime}
            onChangeText={setScheduleTime}
            placeholder="07:00"
            placeholderTextColor={colors.textLight}
            textAlign="left"
          />
        </View>
        <View style={styles.row}>
          <View style={styles.inputGroupSmall}>
            <Text style={styles.label}>חדשות</Text>
            <TextInput
              style={styles.inputSmall}
              value={newsCount}
              onChangeText={setNewsCount}
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>
          <View style={styles.inputGroupSmall}>
            <Text style={styles.label}>תוכן מקצועי</Text>
            <TextInput
              style={styles.inputSmall}
              value={contentCount}
              onChangeText={setContentCount}
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>
        </View>
      </View>

      {/* API Key Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 OpenAI API</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>API Key</Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-..."
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showApiKey}
              textAlign="left"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowApiKey(!showApiKey)}>
              <Ionicons name={showApiKey ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 התראות</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>התראת Push יומית</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={pushEnabled ? colors.primary : colors.textLight}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>מצב כהה</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={darkMode ? colors.primary : colors.textLight}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>שמור הגדרות</Text>
      </TouchableOpacity>

      {/* About */}
      <View style={styles.about}>
        <Text style={styles.aboutTitle}>Eldar Intelligence Hub</Text>
        <Text style={styles.aboutVersion}>גרסה 1.0.0 MVP</Text>
        <Text style={styles.aboutText}>מודיעין חדשות ותוכן יומי</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  statusBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: spacing.sm },
  statusText: { fontSize: fontSize.sm, color: colors.textSecondary, writingDirection: 'rtl' },
  section: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: spacing.md,
  },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, textAlign: 'right', writingDirection: 'rtl', marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  apiKeyRow: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { padding: spacing.sm, marginLeft: spacing.xs },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  inputGroupSmall: { flex: 1, marginHorizontal: spacing.xs },
  inputSmall: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  testButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  testButtonText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600', marginRight: spacing.xs },
  toggleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleLabel: { fontSize: fontSize.md, color: colors.text, writingDirection: 'rtl' },
  saveButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  saveButtonText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700', marginRight: spacing.sm },
  about: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.md },
  aboutTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primaryDark },
  aboutVersion: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  aboutText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
});
