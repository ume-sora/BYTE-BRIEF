import type { Article } from '@/types/news'

const FALLBACK = { name: 'News', color: '#6B7280' }

export function getArticleSourceDisplay(article: Article): { name: string; color: string } {
  const s = article.source
  if (
    s &&
    typeof s === 'object' &&
    typeof (s as { name?: unknown }).name === 'string' &&
    typeof (s as { color?: unknown }).color === 'string'
  ) {
    return { name: (s as { name: string }).name, color: (s as { color: string }).color }
  }
  return FALLBACK
}

export function getArticleSourceName(article: Article): string {
  return getArticleSourceDisplay(article).name
}
