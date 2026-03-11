import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY_IDS = 'byte-brief-bookmarks'
const STORAGE_KEY_DETAILS = 'byte-brief-bookmarks-details'

export interface BookmarkDetails {
  title: string
  url: string
  source?: string
}

async function loadIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_IDS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

async function loadDetails(): Promise<Record<string, BookmarkDetails>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_DETAILS)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, BookmarkDetails>)
      : {}
  } catch {
    return {}
  }
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>([])
  const [details, setDetails] = useState<Record<string, BookmarkDetails>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([loadIds(), loadDetails()]).then(([loadedIds, loadedDetails]) => {
      setIds(loadedIds)
      setDetails(loadedDetails)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    AsyncStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(ids))
  }, [ids, ready])

  useEffect(() => {
    if (!ready) return
    AsyncStorage.setItem(STORAGE_KEY_DETAILS, JSON.stringify(details))
  }, [details, ready])

  const bookmarks = new Set(ids)

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [ids])

  const toggleBookmark = useCallback((id: string, entryDetails?: BookmarkDetails) => {
    setIds((prev) => {
      const has = prev.includes(id)
      if (has) {
        setDetails((d) => {
          const next = { ...d }
          delete next[id]
          return next
        })
        return prev.filter((x) => x !== id)
      }
      if (entryDetails) {
        setDetails((d) => ({ ...d, [id]: entryDetails }))
      }
      return [...prev, id]
    })
  }, [])

  const bookmarkedList = ids
    .map((id) => ({ id, ...details[id] }))
    .filter(
      (entry): entry is { id: string } & BookmarkDetails => Boolean(details[entry.id]?.title)
    )

  return {
    bookmarks,
    bookmarkedList,
    isBookmarked,
    toggleBookmark,
    ready,
  }
}
