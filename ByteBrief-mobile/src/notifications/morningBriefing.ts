import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import { fetchAllFeeds } from '@/api/rssParser'

const TASK_NAME = 'MORNING_NEWS_PREFETCH'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

// Background task: prefetch news before notification fires
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    await fetchAllFeeds({ language: 'ja', useCorsProxy: false })
    return BackgroundFetch.BackgroundFetchResult.NewData
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

// Request permission (call on app first launch)
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// Schedule a daily notification at the given hour:minute
export async function scheduleMorningNotification(
  hour: number,
  minute: number
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ 今日のITニュース',
      body: '本日のテックニュースが届きました。今すぐ確認しましょう。',
      sound: true,
      badge: 1,
      data: { navigateTo: 'briefing' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })

  // Also register background prefetch
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 60, // 1 hour
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

export async function cancelMorningNotification(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  try {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAME)
  } catch {
    // Task may not be registered
  }
}
