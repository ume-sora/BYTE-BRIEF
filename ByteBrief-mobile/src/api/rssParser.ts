import { XMLParser } from 'fast-xml-parser'
import { RSS_SOURCES, CATEGORY_KEYWORDS, type FeedSource } from './rssFeeds'
import type { Article, Category } from '@/types/news'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

function detectCategory(text: string): Category {
  const normalized = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue
    if (keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return category as Category
    }
  }
  return 'general'
}

function extractImage(item: any): string | undefined {
  return (
    item['media:content']?.['@_url'] ||
    item['media:thumbnail']?.['@_url'] ||
    item.enclosure?.['@_url'] ||
    undefined
  )
}

function parseItems(parsed: any, source: FeedSource): Article[] {
  const channel = parsed?.rss?.channel || parsed?.feed
  if (!channel) return []

  const rawItems = channel.item || channel.entry || []
  const items = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items.map((item: any) => {
    const title = item.title?.['#text'] || item.title || ''
    const description =
      item.description?.['#text'] ||
      item.description ||
      item['content:encoded'] ||
      item.summary ||
      ''
    const link = item.link?.['@_href'] || item.link || item.guid || ''
    const pubDate = item.pubDate || item.updated || item.published || ''
    const category = detectCategory(`${title} ${description}`)

    return {
      id: item.guid?.['#text'] || item.guid || item.id || link,
      title: title.trim(),
      description: description.replace(/<[^>]*>/g, '').slice(0, 200).trim(),
      url: link.trim(),
      urlToImage: extractImage(item),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      source: {
        id: source.id,
        name: source.name,
        color: source.color,
        language: source.language,
      },
      category,
      readTime: Math.max(1, Math.ceil(description.length / 400)),
    }
  })
}

async function fetchFeed(source: FeedSource): Promise<Article[]> {
  try {
    const res = await fetch(source.url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(8000),
    })
    const text = await res.text()
    const parsed = xmlParser.parse(text)
    return parseItems(parsed, source)
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${source.name}:`, err)
    return []
  }
}

export async function fetchAllFeeds(options: {
  language?: 'ja' | 'en' | 'all'
  useCorsProxy?: boolean
} = {}): Promise<Article[]> {
  const { language = 'all' } = options

  const sources =
    language === 'all' ? RSS_SOURCES : RSS_SOURCES.filter((s) => s.language === language)

  const results = await Promise.allSettled(sources.map((source) => fetchFeed(source)))

  const articles = results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  const seen = new Set<string>()
  const unique = articles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })

  return unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}
