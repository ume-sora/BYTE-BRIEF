export type Category =
  | 'ai'
  | 'security'
  | 'cloud'
  | 'devtools'
  | 'startups'
  | 'hardware'
  | 'general'

export type Article = {
  id: string
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    id: string
    name: string
    color: string
    language: 'ja' | 'en'
  }
  category: Category
  readTime: number // estimated read time in minutes
}

/** @deprecated Use Article. Kept for backward compatibility. */
export type NewsArticle = Article

export interface BriefingItem {
  article: Article
  summary: string
}
