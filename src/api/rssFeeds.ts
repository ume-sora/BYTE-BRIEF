import type { Category } from '@/types/news'

export type FeedSource = {
  id: string
  name: string
  url: string
  language: 'ja' | 'en'
  defaultCategory: Category
  color: string // brand color for source badge
}

export const RSS_SOURCES: FeedSource[] = [
  // ── 日本語ソース ──────────────────────────────
  {
    id: 'itmedia',
    name: 'ITmedia',
    url: 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml',
    language: 'ja',
    defaultCategory: 'general',
    color: '#E53935',
  },
  {
    id: 'itmedia-ai',
    name: 'ITmedia AI+',
    url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml',
    language: 'ja',
    defaultCategory: 'ai',
    color: '#7B1FA2',
  },
  {
    id: 'zdnet-jp',
    name: 'ZDNet Japan',
    url: 'https://japan.zdnet.com/rss/index.rdf',
    language: 'ja',
    defaultCategory: 'cloud',
    color: '#1565C0',
  },
  {
    id: 'ascii',
    name: 'ASCII.jp',
    url: 'https://ascii.jp/rss.xml',
    language: 'ja',
    defaultCategory: 'hardware',
    color: '#F57F17',
  },
  {
    id: 'gigazine',
    name: 'Gigazine',
    url: 'https://gigazine.net/news/rss_2.0/',
    language: 'ja',
    defaultCategory: 'general',
    color: '#00897B',
  },
  {
    id: 'techcrunch-jp',
    name: 'TechCrunch Japan',
    url: 'https://jp.techcrunch.com/feed/',
    language: 'ja',
    defaultCategory: 'startups',
    color: '#00BCD4',
  },
  // ── 英語ソース ────────────────────────────────
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    language: 'en',
    defaultCategory: 'startups',
    color: '#00BCD4',
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    language: 'en',
    defaultCategory: 'general',
    color: '#FF6D00',
  },
  {
    id: 'hacker-news',
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    language: 'en',
    defaultCategory: 'devtools',
    color: '#FF6F00',
  },
  {
    id: 'wired',
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    language: 'en',
    defaultCategory: 'general',
    color: '#212121',
  },
]

// カテゴリ自動判定キーワードマップ
export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  ai: ['AI', '人工知能', 'ChatGPT', 'LLM', '生成AI', 'machine learning', 'OpenAI', 'Gemini', 'Claude'],
  security: ['セキュリティ', '脆弱性', '不正アクセス', 'マルウェア', 'security', 'vulnerability', 'breach', 'ransomware'],
  cloud: ['クラウド', 'AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'cloud', 'serverless'],
  devtools: ['開発', 'GitHub', 'VSCode', 'TypeScript', 'React', 'programming', 'developer', 'framework', 'SDK'],
  startups: ['スタートアップ', '資金調達', '買収', 'IPO', 'startup', 'funding', 'acquisition', 'unicorn'],
  hardware: ['チップ', 'CPU', 'GPU', 'Apple Silicon', 'NVIDIA', 'chip', 'processor', 'hardware', 'device'],
  general: [],
}
