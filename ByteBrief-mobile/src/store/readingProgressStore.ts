import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'byte-brief-reading-progress'

function todayKey() {
  return new Date().toDateString()
}

async function loadProgress(): Promise<{ date: string; count: number }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: '', count: 0 }
    const { date, count } = JSON.parse(raw) as { date?: string; count?: number }
    return { date: date ?? '', count: typeof count === 'number' ? count : 0 }
  } catch {
    return { date: '', count: 0 }
  }
}

async function saveProgress(date: string, count: number) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date, count }))
  } catch {
    // ignore
  }
}

/** AsyncStorage の読み書きを直列化（hydrate と increment の競合防止） */
let storageChain: Promise<unknown> = Promise.resolve()

function runStorageExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const done = storageChain.then(() => fn())
  storageChain = done.then(
    () => undefined,
    () => undefined
  )
  return done
}

interface ReadingProgressState {
  dailyCount: number
  hydrated: boolean
  hydrate: () => Promise<void>
  increment: () => Promise<void>
}

export const useReadingProgressStore = create<ReadingProgressState>((set) => ({
  dailyCount: 0,
  hydrated: false,

  hydrate: () =>
    runStorageExclusive(async () => {
      const key = todayKey()
      const { date, count } = await loadProgress()
      if (date !== key) {
        await saveProgress(key, 0)
        set({ dailyCount: 0, hydrated: true })
      } else {
        set({ dailyCount: count, hydrated: true })
      }
    }),

  increment: () =>
    runStorageExclusive(async () => {
      const key = todayKey()
      const { date, count } = await loadProgress()
      const base = date === key ? count : 0
      const next = base + 1
      await saveProgress(key, next)
      set({ dailyCount: next, hydrated: true })
    }),
}))
