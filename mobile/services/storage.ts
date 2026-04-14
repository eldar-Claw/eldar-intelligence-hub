import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BACKEND_URL: 'backend_url',
  SETTINGS: 'settings',
};

export async function getBackendUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(KEYS.BACKEND_URL);
    return url || 'http://localhost:3001';
  } catch {
    return 'http://localhost:3001';
  }
}

export async function setBackendUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.BACKEND_URL, url);
}

export async function getSetting(key: string, fallback: string = ''): Promise<string> {
  try {
    const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed[key] || fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(KEYS.SETTINGS);
    const settings = existing ? JSON.parse(existing) : {};
    settings[key] = value;
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore errors
  }
}
