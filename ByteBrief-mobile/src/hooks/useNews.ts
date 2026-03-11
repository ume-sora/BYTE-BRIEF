import { useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNewsStore } from '@/store/newsStore'
import { fetchAllFeeds } from '@/api/rssParser'
import type { Article } from '@/types/news'

function toNormalizedCategory(selected: string): string {
  if (selected === 'general') return 'general'
  return selected.toLowerCase().replace(/\s+/g, '')
}

export function useNews(options?: { categoryFilter?: string }) {
  const { i18n } = useTranslation()
  const language = i18n.language === 'ja' ? 'ja' : 'en'

  const {
    selectedCategory,
    searchQuery,
    readIds,
    setSelectedCategory,
    setSearchQuery,
    markAsRead,
  } = useNewsStore()

  const query = useQuery({
    queryKey: ['news', language],
    queryFn: () => fetchAllFeeds({ language, useCorsProxy: false }),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  })

  const rawArticles = query.data ?? []
  const normalizedCategory = toNormalizedCategory(options?.categoryFilter ?? selectedCategory)

  const filteredArticles = useMemo(() => {
    let list = rawArticles
    if (normalizedCategory !== 'general') {
      list = list.filter((a) => a.category === normalizedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const sourceName = (a: Article) =>
        typeof a.source === 'string' ? a.source : a.source.name
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description?.toLowerCase().includes(q) ?? false) ||
          sourceName(a).toLowerCase().includes(q)
      )
    }
    return list
  }, [rawArticles, normalizedCategory, searchQuery])

  const error = query.error
    ? {
        type: 'error' as const,
        message:
          query.error instanceof Error ? query.error.message : 'Failed to fetch news',
      }
    : null

  return {
    articles: filteredArticles,
    rawArticles,
    selectedCategory,
    searchQuery,
    readIds,
    loading: query.isLoading,
    error,
    setSelectedCategory,
    setSearchQuery,
    markAsRead,
    refresh: () => query.refetch(),
  }
}
