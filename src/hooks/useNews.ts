import { useMemo, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNewsStore } from '@/store/newsStore'
import { fetchAllFeeds } from '@/api/rssParser'
import type { NewsArticle } from '@/types/news'

// Map UI category (e.g. 'AI', 'Dev Tools') to normalized Article.category
function toNormalizedCategory(selected: string): string {
  if (selected === 'general') return 'general'
  return selected.toLowerCase().replace(/\s+/g, '')
}

export function useNews() {
  const { i18n } = useTranslation()
  const language = i18n.language === 'ja' ? 'ja' : 'en'

  const {
    viewMode,
    selectedCategory,
    searchQuery,
    readIds,
    lastUpdated,
    setArticles,
    setViewMode,
    setSelectedCategory,
    setSearchQuery,
    markAsRead,
    setLastUpdated,
    setLoading,
    setError,
  } = useNewsStore()

  const query = useQuery({
    queryKey: ['news', language],
    queryFn: () => fetchAllFeeds({ language, useCorsProxy: true }),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 2,
  })

  const rawArticles = query.data ?? []

  // Sync loading and error to store for UI that may depend on it
  useEffect(() => {
    setLoading(query.isLoading)
  }, [query.isLoading, setLoading])

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setArticles(query.data)
      setLastUpdated(new Date().toISOString())
      setError(null)
    }
  }, [query.isSuccess, query.data, setArticles, setLastUpdated, setError])

  const normalizedCategory = toNormalizedCategory(selectedCategory)

  const filteredArticles = useMemo(() => {
    let list = rawArticles

    if (viewMode === 'feed' && normalizedCategory !== 'general') {
      list = list.filter((a) => a.category === normalizedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const sourceName = (a: NewsArticle) =>
        typeof a.source === 'string' ? a.source : a.source.name
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description?.toLowerCase().includes(q) ?? false) ||
          sourceName(a).toLowerCase().includes(q)
      )
    }

    return list
  }, [rawArticles, viewMode, normalizedCategory, searchQuery])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const error = query.error
    ? {
        type: 'error' as const,
        message: query.error instanceof Error ? query.error.message : 'Failed to fetch news',
      }
    : null

  return {
    articles: filteredArticles,
    viewMode,
    selectedCategory,
    searchQuery,
    readIds,
    lastUpdated,
    loading: query.isLoading,
    hasMore: false,
    error,
    setViewMode,
    setSelectedCategory,
    setSearchQuery,
    markAsRead,
    clearError,
    loadMore: () => {},
    refresh: () => query.refetch(),
  }
}
