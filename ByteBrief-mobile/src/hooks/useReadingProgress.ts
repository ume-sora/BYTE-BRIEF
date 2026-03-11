import { useCallback, useEffect, useState } from 'react'
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

export function useReadingProgress() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const key = todayKey()
    loadProgress().then(({ date, count: saved }) => {
      if (date === key) setCount(saved)
      else setCount(0)
    })
  }, [])

  const increment = useCallback(() => {
    const key = todayKey()
    setCount((c) => {
      const next = c + 1
      saveProgress(key, next)
      return next
    })
  }, [])

  const dailyCount = count
  return { dailyCount, increment }
}
