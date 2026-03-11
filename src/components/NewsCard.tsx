import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatRelativeTime } from '@/utils/formatDate'

export interface NewsCardArticle {
  id?: string
  title: string
  description?: string | null
  url: string
  urlToImage?: string | null
  publishedAt: string
  source: { name: string } | string
  category: string
}

export interface BookmarkDetailsPayload {
  title: string
  url: string
  source?: string
}

export interface NewsCardProps {
  article: NewsCardArticle
  isRead: boolean
  isBookmarked: boolean
  onRead: (id: string, url: string) => void
  onBookmark: (id: string, details: BookmarkDetailsPayload) => void
  /** Optional delay in ms for stagger animation */
  animationDelay?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ai: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  security: 'bg-red-500/20 text-red-300 border-red-500/30',
  cloud: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  devtools: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  startups: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  hardware: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
}

function sourceName(source: NewsCardArticle['source']): string {
  return typeof source === 'string' ? source : source.name
}

function NewsCardComponent({
  article,
  isRead,
  isBookmarked,
  onRead,
  onBookmark,
  animationDelay = 0,
}: NewsCardProps) {
  const { t, i18n } = useTranslation()
  const isJa = i18n.language === 'ja'
  const locale = i18n.language === 'ja' ? 'ja' : 'en'
  const timeStr = formatRelativeTime(article.publishedAt, locale)
  const badgeClass = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.general
  const titleClampClass = isJa ? 'line-clamp-2-jp' : 'line-clamp-2'
  const descTextClass = isJa ? 'text-jp' : 'text-en'

  return (
    <article
      className={`animate-news-card-in relative flex gap-3 rounded-lg border p-3 transition-all duration-300 ${isRead ? 'news-card-read' : ''}`}
      style={{
        backgroundColor: '#161B22',
        borderColor: '#1E2530',
        animationDelay: `${animationDelay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#00D4FF'
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1E2530'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault()
          onRead(article.id ?? article.url, article.url)
        }}
        className="shrink-0"
      >
        {article.urlToImage ? (
          <img
            src={article.urlToImage}
            alt=""
            className="h-20 w-20 rounded-md object-cover"
            width={80}
            height={80}
          />
        ) : (
          <div className="h-20 w-20 rounded-md bg-[#1E2530]" />
        )}
      </a>

      <div className="min-w-0 flex-1">
        <div className={`mb-1 flex items-center gap-2 font-body text-[11px] text-gray-500 opacity-50 ${descTextClass}`}>
          <span>{sourceName(article.source)}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>{timeStr}</time>
        </div>
        <span
          className={`inline-block rounded border px-1.5 py-0.5 font-display text-[10px] ${isJa ? '' : 'uppercase'} ${badgeClass}`}
        >
          {t(`categories.${article.category}`)}
        </span>
        <h2 className={`mt-1 font-display text-[13px] font-bold leading-snug text-gray-100 sm:text-[15px] ${titleClampClass}`}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              onRead(article.id ?? article.url, article.url)
            }}
          >
            {article.title}
          </a>
        </h2>
        {article.description && (
          <p className={`mt-0.5 text-xs text-gray-400 opacity-80 ${titleClampClass} ${descTextClass}`}>{article.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onBookmark(article.id ?? article.url, {
            title: article.title,
            url: article.url,
            source: typeof article.source === 'string' ? article.source : article.source.name,
          })
        }}
        className="absolute right-3 top-3 shrink-0 rounded p-1 text-gray-500 transition hover:text-[#00D4FF]"
        aria-label={isBookmarked ? t('actions.remove_bookmark') : t('actions.add_bookmark')}
      >
        <svg
          className="h-5 w-5"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>
    </article>
  )
}

export const NewsCard = React.memo(NewsCardComponent)
