import { Stack } from 'expo-router';
import { I18nManager, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { colors } from '../constants/theme';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
