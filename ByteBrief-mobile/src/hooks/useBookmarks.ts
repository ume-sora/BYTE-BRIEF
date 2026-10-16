import { useCallback, useEffect, useState } from 'react'
import {
  useBookmarkStore,
  migrateLegacyBookmarksIfNeeded,
  type BookmarkDetails,
} from '@/store/bookmarkStore'

export type { BookmarkDetails }

export function useBookmarks() {
  const ids = useBookmarkStore((s) => s.ids)
  const details = useBookmarkStore((s) => s.details)
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark)
  const [ready, setReady] = useState(() => useBookmarkStore.persist.hasHydrated())

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!useBookmarkStore.persist.hasHydrated()) {
        await Promise.race([
          new Promise<void>((resolve) => {
            const unsub = useBookmarkStore.persist.onFinishHydration(() => {
              unsub()
              resolve()
            })
          }),
          new Promise<void>((resolve) => {
            setTimeout(resolve, 5000)
          }),
        ])
      }
      await migrateLegacyBookmarksIfNeeded()
      if (!cancelled) setReady(true)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const bookmarks = new Set(ids)
  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [ids])

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
