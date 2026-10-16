import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Category } from '@/types/news'

/** Legacy keys from the pre-store hook (direct AsyncStorage writes). */
const LEGACY_KEY_IDS = 'byte-brief-bookmarks'
const LEGACY_KEY_DETAILS = 'byte-brief-bookmarks-details'

const PERSIST_NAME = 'byte-brief-bookmarks-v2'

export interface BookmarkDetails {
  title: string
  url: string
  source?: string
  category?: Category
  thumbnailUrl?: string
  savedAt?: number
}

type BookmarkPersisted = {
  ids: string[]
  details: Record<string, BookmarkDetails>
}

type BookmarkStore = BookmarkPersisted & {
  toggleBookmark: (id: string, entryDetails?: BookmarkDetails) => void
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      ids: [],
      details: {},
      toggleBookmark: (id, entryDetails) => {
        const { ids, details } = get()
        const has = ids.includes(id)
        if (has) {
          const nextDetails = { ...details }
          delete nextDetails[id]
          set({ ids: ids.filter((x) => x !== id), details: nextDetails })
          return
        }
        if (entryDetails) {
          set({
            ids: [...ids, id],
            details: {
              ...details,
              [id]: {
                ...entryDetails,
                savedAt:
                  typeof entryDetails.savedAt === 'number'
                    ? entryDetails.savedAt
                    : Date.now(),
              },
            },
          })
        } else {
          set({ ids: [...ids, id] })
        }
      },
    }),
    {
      name: PERSIST_NAME,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): BookmarkPersisted => ({ ids: s.ids, details: s.details }),
    }
  )
)

/** One-time import from legacy AsyncStorage keys into the persisted store. */
export async function migrateLegacyBookmarksIfNeeded(): Promise<void> {
  const { ids, details } = useBookmarkStore.getState()
  if (ids.length > 0 || Object.keys(details).length > 0) return

  try {
    const [[, rawIds], [, rawDet]] = await AsyncStorage.multiGet([
      LEGACY_KEY_IDS,
      LEGACY_KEY_DETAILS,
    ])
    const parsedIds = rawIds ? (JSON.parse(rawIds) as unknown) : []
    const parsedDet = rawDet ? (JSON.parse(rawDet) as unknown) : {}
    const nextIds = Array.isArray(parsedIds)
      ? parsedIds.filter((x): x is string => typeof x === 'string')
      : []
    const nextDetails =
      typeof parsedDet === 'object' && parsedDet !== null && !Array.isArray(parsedDet)
        ? (parsedDet as Record<string, BookmarkDetails>)
        : {}
    if (nextIds.length === 0 && Object.keys(nextDetails).length === 0) return

    useBookmarkStore.setState({ ids: nextIds, details: nextDetails })
    await AsyncStorage.multiRemove([LEGACY_KEY_IDS, LEGACY_KEY_DETAILS])
  } catch {
    // ignore corrupt legacy payloads
  }
}
