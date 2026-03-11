import { create } from 'zustand'
import type { Article } from '@/types/news'

export interface NewsError {
  type: 'timeout' | 'rate_limit' | 'error'
  message: string
}

interface NewsState {
  selectedCategory: string
  searchQuery: string
  readIds: Set<string>
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  markAsRead: (id: string) => void
}

export const useNewsStore = create<NewsState>((set) => ({
  selectedCategory: 'general',
  searchQuery: '',
  readIds: new Set(),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  markAsRead: (id) =>
    set((s) => {
      const next = new Set(s.readIds)
      next.add(id)
      return { readIds: next }
    }),
}))
