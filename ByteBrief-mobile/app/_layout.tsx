import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Notifications from 'expo-notifications'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SplashScreen from 'expo-splash-screen'
import {
  requestNotificationPermission,
  scheduleMorningNotification,
} from '../src/notifications/morningBriefing'

const NOTIFICATION_PREFS_KEY = 'byte-brief-notification-prefs'
import '../src/i18n'
import i18n from '../src/i18n'

const LANG_STORAGE_KEY = 'byte-brief-lang'
const ONBOARDED_KEY = 'byte-brief-onboarded'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'BYTEBRIEF_QUERY_CACHE',
})

export default function RootLayout() {
  const router = useRouter()
  const lastNotificationResponse = Notifications.useLastNotificationResponse()

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((stored) => {
      if (stored === 'ja' || stored === 'en') {
        i18n.changeLanguage(stored)
      }
    })
    SplashScreen.hideAsync()
  }, [])

  // First launch: request notification permission and schedule default morning notification
  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(ONBOARDED_KEY).then(async (onboarded) => {
      if (cancelled || onboarded === 'true') return
      const granted = await requestNotificationPermission()
      const hour = 7
      const minute = 30
      if (granted) {
        await scheduleMorningNotification(hour, minute)
        await AsyncStorage.setItem(
          NOTIFICATION_PREFS_KEY,
          JSON.stringify({ enabled: true, hour, minute })
        )
      } else {
        await AsyncStorage.setItem(
          NOTIFICATION_PREFS_KEY,
          JSON.stringify({ enabled: false, hour, minute })
        )
      }
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true')
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Notification tap: navigate to briefing
  useEffect(() => {
    const data = lastNotificationResponse?.notification.request.content.data as
      | { navigateTo?: string }
      | undefined
    if (data?.navigateTo === 'briefing') {
      router.replace('/(tabs)/')
    }
  }, [lastNotificationResponse, router])

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0D0F14' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="article"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: '#0D0F14' },
              headerTintColor: '#00D4FF',
            }}
          />
        </Stack>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  )
}
