import { useEffect, useCallback } from 'react'
import { useReadingProgressStore } from '@/store/readingProgressStore'

export function useReadingProgress() {
  const dailyCount = useReadingProgressStore((s) => s.dailyCount)
  const hydrate = useReadingProgressStore((s) => s.hydrate)
  const incrementFromStore = useReadingProgressStore((s) => s.increment)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const increment = useCallback(
    (articleId: string) => {
      void incrementFromStore(articleId)
    },
    [incrementFromStore]
  )

  return { dailyCount, increment }
}
