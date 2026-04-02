import { useMemo, useCallback } from 'react'
import { Platform } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNewsStore } from '@/store/newsStore'
import { fetchAllFeeds } from '@/api/rssParser'
import type { Article } from '@/types/news'
import { getArticleSourceName } from '@/utils/articleSource'

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
    queryFn: () =>
      fetchAllFeeds({ language, useCorsProxy: Platform.OS === 'web' }),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    /** 永続キャッシュが空配列だと isLoading が false のまま再取得されないのを防ぐ */
    refetchOnMount: (q) => {
      const rows = q.state.data as Article[] | undefined
      return !rows || rows.length === 0 ? 'always' : true
    },
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
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description?.toLowerCase().includes(q) ?? false) ||
          getArticleSourceName(a).toLowerCase().includes(q)
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

  const listLoading =
    query.isPending || (query.isFetching && rawArticles.length === 0)

  return {
    articles: filteredArticles,
    rawArticles,
    selectedCategory,
    searchQuery,
    readIds,
    loading: listLoading,
    isFetching: query.isFetching,
    error,
    setSelectedCategory,
    setSearchQuery,
    markAsRead,
    refresh: () => query.refetch(),
  }
}
