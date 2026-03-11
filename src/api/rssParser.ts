import Parser from 'rss-parser'
import { RSS_SOURCES, CATEGORY_KEYWORDS, type FeedSource } from './rssFeeds'
import type { Article, Category } from '@/types/news'

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
})

// CORS proxy for browser environments
// In React Native, fetch works directly — pass useCorsProxy=false
function buildUrl(feedUrl: string, useCorsProxy: boolean): string {
  if (!useCorsProxy) return feedUrl
  return `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`
}

// Detect category from title + description keywords
function detectCategory(text: string): Category {
  const normalizedText = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue
    if (keywords.some((kw) => normalizedText.includes(kw.toLowerCase()))) {
      return category as Category
    }
  }
  return 'general'
}

// Extract thumbnail URL from RSS item
function extractImage(item: Record<string, unknown>): string | undefined {
  const mediaContent = item['media:content'] as { $?: { url?: string } } | undefined
  const mediaThumb = item['media:thumbnail'] as { $?: { url?: string } } | undefined
  const enclosure = item.enclosure as { url?: string } | undefined
  const itunesImage = item['itunes:image'] as { $?: { href?: string } } | undefined
  return (
    mediaContent?.$?.url ??
    mediaThumb?.$?.url ??
    enclosure?.url ??
    itunesImage?.$?.href ??
    undefined
  )
}

// Normalize a single RSS item into our Article type
function normalizeItem(
  item: { title?: string; contentSnippet?: string; guid?: string; link?: string; isoDate?: string; [k: string]: unknown },
  source: FeedSource
): Article {
  const titleAndDesc = `${item.title ?? ''} ${item.contentSnippet ?? ''}`
  const category = detectCategory(titleAndDesc) ?? source.defaultCategory

  return {
    id: (item.guid as string) || (item.link as string) || `${source.id}-${item.isoDate}`,
    title: (item.title as string) ?? '(タイトルなし)',
    description: (item.contentSnippet as string)?.slice(0, 200) ?? '',
    url: (item.link as string) ?? '',
    urlToImage: extractImage(item as Record<string, unknown>),
    publishedAt: (item.isoDate as string) ?? new Date().toISOString(),
    source: {
      id: source.id,
      name: source.name,
      color: source.color,
      language: source.language,
    },
    category,
    readTime: Math.max(1, Math.ceil(((item.contentSnippet as string)?.length ?? 200) / 400)),
  }
}

// Fetch a single RSS feed with error isolation
async function fetchFeed(source: FeedSource, useCorsProxy: boolean): Promise<Article[]> {
  try {
    const url = buildUrl(source.url, useCorsProxy)
    let feedText: string

    if (useCorsProxy) {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      const json = (await res.json()) as { contents?: string }
      feedText = json.contents ?? ''
    } else {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      feedText = await res.text()
    }

    const feed = await parser.parseString(feedText)
    return (feed.items ?? []).map((item) =>
      normalizeItem(item as unknown as Parameters<typeof normalizeItem>[0], source)
    )
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${source.name}:`, err)
    return []
  }
}

// Main fetch function — fetches all sources in parallel
export async function fetchAllFeeds(options: {
  language?: 'ja' | 'en' | 'all'
  useCorsProxy?: boolean
} = {}): Promise<Article[]> {
  const { language = 'all', useCorsProxy = true } = options

  const sources =
    language === 'all' ? RSS_SOURCES : RSS_SOURCES.filter((s) => s.language === language)

  const results = await Promise.allSettled(
    sources.map((source) => fetchFeed(source, useCorsProxy))
  )

  const articles = results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  // Deduplicate by URL
  const seen = new Set<string>()
  const unique = articles.filter((a) => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })

  // Sort by publishedAt descending
  return unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}
