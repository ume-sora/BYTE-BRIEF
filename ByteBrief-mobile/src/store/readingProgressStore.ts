import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'byte-brief-reading-progress'

function todayKey() {
  return new Date().toDateString()
}

type StoredProgress = { date: string; articleIds: string[] }

async function loadProgress(): Promise<StoredProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: '', articleIds: [] }
    const parsed = JSON.parse(raw) as {
      date?: string
      count?: number
      articleIds?: unknown
    }
    const date = parsed.date ?? ''
    if (
      Array.isArray(parsed.articleIds) &&
      parsed.articleIds.every((x) => typeof x === 'string')
    ) {
      return { date, articleIds: parsed.articleIds }
    }
    // Legacy { date, count } — switch to per-article tracking (no reliable id list)
    return { date, articleIds: [] }
  } catch {
    return { date: '', articleIds: [] }
  }
}

async function saveProgress(date: string, articleIds: string[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date, articleIds }))
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
  /** Counts each article at most once per calendar day (local). */
  increment: (articleId: string) => Promise<void>
}

export const useReadingProgressStore = create<ReadingProgressState>((set) => ({
  dailyCount: 0,
  hydrated: false,

  hydrate: () =>
    runStorageExclusive(async () => {
      const key = todayKey()
      const { date, articleIds } = await loadProgress()
      if (date !== key) {
        await saveProgress(key, [])
        set({ dailyCount: 0, hydrated: true })
      } else {
        set({ dailyCount: articleIds.length, hydrated: true })
      }
    }),

  increment: (articleId: string) =>
    runStorageExclusive(async () => {
      if (!articleId) return
      const key = todayKey()
      const { date, articleIds } = await loadProgress()
      const ids = date === key ? [...articleIds] : []
      if (ids.includes(articleId)) return
      ids.push(articleId)
      await saveProgress(key, ids)
      set({ dailyCount: ids.length, hydrated: true })
    }),
}))
