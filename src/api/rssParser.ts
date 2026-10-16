import { XMLParser } from 'fast-xml-parser'
import { RSS_SOURCES, CATEGORY_KEYWORDS, type FeedSource } from './rssFeeds'
import type { Article, Category } from '@/types/news'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

// Parsed XML node (fast-xml-parser output)
type XmlNode = Record<string, unknown>

// CORS proxy for browser environments
// Dev: Vite server.proxy (/rss-proxy/<id>) returns the raw feed
// Prod: allorigins wraps the feed in JSON
// In React Native, fetch works directly — pass useCorsProxy=false
type FeedRequest = { url: string; wrappedInJson: boolean }

function buildRequest(source: FeedSource, useCorsProxy: boolean): FeedRequest {
  if (!useCorsProxy) return { url: source.url, wrappedInJson: false }
  if (import.meta.env.DEV) return { url: `/rss-proxy/${source.id}`, wrappedInJson: false }
  return {
    url: `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`,
    wrappedInJson: true,
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
}

/** RSS の見出し・本文に残る HTML エンティティ（&#8217; / &amp; など）を文字に戻す */
function decodeEntities(text: string): string {
  // &amp;#8217; のような二重エンコードにも対応するため2回まで処理する
  let result = text
  for (let i = 0; i < 2 && result.includes('&'); i++) {
    result = result.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === '#') {
        const point =
          code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
        return Number.isFinite(point) && point <= 0x10ffff ? String.fromCodePoint(point) : match
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match
    })
  }
  return result
}

/** タグ除去・エンティティ変換したうえで、本文として意味のない定型文（hnrss のリンク一覧）は空にする */
function cleanDescription(html: string): string {
  const text = decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
  return /^Article URL:/i.test(text) ? '' : text
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

// Text content of a node that may be a string or { '#text': ... }
function textOf(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && '#text' in value) {
    return String((value as XmlNode)['#text'])
  }
  return ''
}

function attrOf(value: unknown, name: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const attr = (value as XmlNode)[`@_${name}`]
  return typeof attr === 'string' ? attr : undefined
}

// Extract thumbnail URL from RSS item
function extractImage(item: XmlNode): string | undefined {
  return (
    attrOf(item['media:content'], 'url') ??
    attrOf(item['media:thumbnail'], 'url') ??
    attrOf(item.enclosure, 'url') ??
    attrOf(item['itunes:image'], 'href')
  )
}

// Atom / 一部 RSS で link が配列・オブジェクトになるため正規化
function extractLink(link: unknown): string {
  if (Array.isArray(link)) {
    const alternate = link.find((l) => attrOf(l, 'rel') === undefined || attrOf(l, 'rel') === 'alternate')
    return extractLink(alternate ?? link[0])
  }
  return (attrOf(link, 'href') ?? textOf(link)).trim()
}

function toIsoDate(raw: string): string {
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

// Normalize a single RSS / Atom item into our Article type
function normalizeItem(item: XmlNode, source: FeedSource, index: number): Article {
  const title = decodeEntities(textOf(item.title)).trim()
  const description = cleanDescription(
    textOf(item.description ?? item.summary ?? item['content:encoded'] ?? item.content)
  )
  const url = extractLink(item.link) || textOf(item.guid).trim() || textOf(item.id).trim()
  const titleAndDesc = `${title} ${description}`
  const category = detectCategory(titleAndDesc) ?? source.defaultCategory

  return {
    id: textOf(item.guid).trim() || textOf(item.id).trim() || url || `${source.id}-${index}`,
    title: title || '(タイトルなし)',
    description: description.slice(0, 200),
    url,
    urlToImage: extractImage(item),
    publishedAt: toIsoDate(textOf(item.pubDate ?? item.updated ?? item.published ?? item['dc:date'])),
    source: {
      id: source.id,
      name: source.name,
      color: source.color,
      language: source.language,
    },
    category,
    readTime: Math.max(1, Math.ceil((description.length || 200) / 400)),
  }
}

// RSS 2.0 (<rss><channel><item>) と Atom (<feed><entry>) の両方に対応
function parseFeed(xml: string, source: FeedSource): Article[] {
  const parsed = xmlParser.parse(xml) as { rss?: { channel?: XmlNode }; feed?: XmlNode }
  const channel = parsed.rss?.channel ?? parsed.feed
  if (!channel) return []
  const rawItems = channel.item ?? channel.entry ?? []
  const items = (Array.isArray(rawItems) ? rawItems : [rawItems]) as XmlNode[]
  return items.map((item, index) => normalizeItem(item, source, index))
}

const FEED_FETCH_MS = 8000

function createAbortSignalWithTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const ctrl = new AbortController()
  const timeoutId = setTimeout(() => ctrl.abort(), ms)
  return {
    signal: ctrl.signal,
    cancel: () => clearTimeout(timeoutId),
  }
}

// Fetch a single RSS feed with error isolation
async function fetchFeed(source: FeedSource, useCorsProxy: boolean): Promise<Article[]> {
  const { signal, cancel } = createAbortSignalWithTimeout(FEED_FETCH_MS)
  try {
    const { url, wrappedInJson } = buildRequest(source, useCorsProxy)
    const res = await fetch(url, { signal })
    if (!res.ok) {
      console.warn(`[RSS] HTTP ${res.status} for ${source.name}`)
      return []
    }

    let feedText: string
    if (wrappedInJson) {
      const json = (await res.json()) as { contents?: string }
      feedText = json.contents ?? ''
    } else {
      feedText = await res.text()
    }

    return parseFeed(feedText, source)
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${source.name}:`, err)
    return []
  } finally {
    cancel()
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
