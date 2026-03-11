import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY_IDS = 'byte-brief-bookmarks'
const STORAGE_KEY_DETAILS = 'byte-brief-bookmarks-details'

export interface BookmarkDetails {
  title: string
  url: string
  source?: string
}

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IDS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function loadDetails(): Record<string, BookmarkDetails> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DETAILS)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, BookmarkDetails>) : {}
  } catch {
    return {}
  }
}

function saveIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

function saveDetails(details: Record<string, BookmarkDetails>) {
  try {
    localStorage.setItem(STORAGE_KEY_DETAILS, JSON.stringify(details))
  } catch {
    // ignore
  }
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>(() => loadIds())
  const [details, setDetails] = useState<Record<string, BookmarkDetails>>(() => loadDetails())

  useEffect(() => {
    setIds(loadIds())
    setDetails(loadDetails())
  }, [])

  useEffect(() => {
    saveIds(ids)
  }, [ids])

  useEffect(() => {
    saveDetails(details)
  }, [details])

  const bookmarks = new Set(ids)

  const isBookmarked = useCallback(
    (id: string) => bookmarks.has(id),
    [ids]
  )

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
    .filter((entry): entry is { id: string } & BookmarkDetails =>
      Boolean(details[entry.id]?.title)
    )

  return {
    bookmarks,
    bookmarkedList,
    isBookmarked,
    toggleBookmark,
  }
}
