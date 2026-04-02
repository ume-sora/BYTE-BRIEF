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

/** Atom / 一部 RSS で link が配列・オブジェクトになるため正規化 */
function extractItemLink(item: any): string {
  const link = item.link
  if (typeof link === 'string') return link.trim()
  if (link?.['@_href']) return String(link['@_href']).trim()
  if (link?.['#text']) return String(link['#text']).trim()
  if (Array.isArray(link)) {
    for (const entry of link) {
      const u = extractItemLink({ link: entry })
      if (u) return u
    }
  }
  const guid = item.guid
  if (typeof guid === 'string') return guid.trim()
  if (guid?.['#text']) return String(guid['#text']).trim()
  if (guid?.['@_isPermaLink'] !== undefined && guid?.['#text']) {
    return String(guid['#text']).trim()
  }
  const id = item.id
  if (typeof id === 'string') return id.trim()
  if (id?.['#text']) return String(id['#text']).trim()
  return ''
}

function parseItems(parsed: any, source: FeedSource): Article[] {
  const channel = parsed?.rss?.channel || parsed?.feed
  if (!channel) return []

  const rawItems = channel.item || channel.entry || []
  const items = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items.map((item: any, index: number) => {
    const title = item.title?.['#text'] || item.title || ''
    const description =
      item.description?.['#text'] ||
      item.description ||
      item['content:encoded'] ||
      item.summary ||
      ''
    const link = extractItemLink(item)
    const pubDate = item.pubDate || item.updated || item.published || ''
    const category = detectCategory(`${title} ${description}`)

    const guidRaw = item.guid?.['#text'] ?? item.guid
    const idRaw =
      (typeof guidRaw === 'string' ? guidRaw : guidRaw?.['#text']) ||
      (typeof item.id === 'string' ? item.id : item.id?.['#text']) ||
      link
    const stableId = String(idRaw ?? '').trim() || `${source.id}-${index}`

    return {
      id: stableId,
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

function resolveFeedUrl(feedUrl: string, useCorsProxy: boolean): string {
  if (!useCorsProxy) return feedUrl
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`
}

const FEED_FETCH_MS = 15000

async function fetchFeed(source: FeedSource, useCorsProxy: boolean): Promise<Article[]> {
  const url = resolveFeedUrl(source.url, useCorsProxy)
  const ctrl = new AbortController()
  const timeoutId = setTimeout(() => ctrl.abort(), FEED_FETCH_MS)
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'ByteBrief/1.0 (compatible; RSS reader)',
      },
      signal: ctrl.signal,
    })
    if (!res.ok) {
      console.warn(`[RSS] HTTP ${res.status} for ${source.name}`)
      return []
    }
    const text = await res.text()
    const parsed = xmlParser.parse(text)
    return parseItems(parsed, source)
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${source.name}:`, err)
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchAllFeeds(options: {
  language?: 'ja' | 'en' | 'all'
  useCorsProxy?: boolean
} = {}): Promise<Article[]> {
  const { language = 'all', useCorsProxy = false } = options

  const sources =
    language === 'all' ? RSS_SOURCES : RSS_SOURCES.filter((s) => s.language === language)

  const results = await Promise.allSettled(
    sources.map((source) => fetchFeed(source, useCorsProxy))
  )

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
