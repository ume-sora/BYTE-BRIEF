import { create } from 'zustand'
import type { NewsArticle } from '@/types/news'

type ViewMode = 'feed' | 'briefing'

export type NewsErrorType = 'timeout' | 'rate_limit' | 'error'

export interface NewsError {
  type: NewsErrorType
  message: string
}

interface NewsState {
  articles: NewsArticle[]
  filteredArticles: NewsArticle[]
  viewMode: ViewMode
  selectedCategory: string
  searchQuery: string
  readIds: Set<string>
  lastUpdated: string | null
  loading: boolean
  hasMore: boolean
  error: NewsError | null
  setArticles: (articles: NewsArticle[]) => void
  setFilteredArticles: (articles: NewsArticle[]) => void
  setViewMode: (mode: ViewMode) => void
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  markAsRead: (id: string) => void
  setLastUpdated: (date: string | null) => void
  setLoading: (loading: boolean) => void
  setHasMore: (hasMore: boolean) => void
  setError: (error: NewsError | null) => void
  appendArticles: (articles: NewsArticle[]) => void
  setReadIds: (ids: Set<string>) => void
}

export const useNewsStore = create<NewsState>((set) => ({
  articles: [],
  filteredArticles: [],
  viewMode: 'feed',
  selectedCategory: 'general',
  searchQuery: '',
  readIds: new Set(),
  lastUpdated: null,
  loading: false,
  hasMore: true,
  error: null,
  setArticles: (articles) => set({ articles, filteredArticles: articles }),
  setFilteredArticles: (filteredArticles) => set({ filteredArticles }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  markAsRead: (id) =>
    set((s) => {
      const next = new Set(s.readIds)
      next.add(id)
      return { readIds: next }
    }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  setLoading: (loading) => set({ loading }),
  setHasMore: (hasMore) => set({ hasMore }),
  setError: (error) => set({ error }),
  appendArticles: (articles) =>
    set((s) => {
      const seen = new Set(s.articles.map((a) => a.id))
      const newOnes = articles.filter((a) => !seen.has(a.id))
      const combined = [...s.articles, ...newOnes]
      return { articles: combined, filteredArticles: combined, hasMore: articles.length >= 20 }
    }),
  setReadIds: (readIds) => set({ readIds }),
}))
