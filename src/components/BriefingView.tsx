import type { NewsArticle } from '@/types/news'
import { useTranslation } from 'react-i18next'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { formatRelativeTime, formatReadTime } from '@/utils/formatDate'

interface BriefingViewProps {
  articles: NewsArticle[]
  readIds: Set<string>
  lastUpdated: string | null
  loading: boolean
  onMarkAsRead: (id: string) => void
}

function formatDateAndDay(locale: string): string {
  const d = new Date()
  const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US'
  const date = d.toLocaleDateString(localeCode, { month: 'long', day: 'numeric', year: 'numeric' })
  const day = d.toLocaleDateString(localeCode, { weekday: 'long' })
  return `${day}, ${date}`
}

export function BriefingView({
  articles,
  readIds,
  lastUpdated,
  loading,
  onMarkAsRead,
}: BriefingViewProps) {
  const { t, i18n } = useTranslation()
  const { increment } = useReadingProgress()
  const locale = i18n.language === 'ja' ? 'ja' : 'en'
  const lastUpdatedStr = lastUpdated ? formatRelativeTime(lastUpdated, locale) : '—'
  const top5 = articles.slice(0, 5)
  const isJa = i18n.language === 'ja'
  const titleClampClass = isJa ? 'line-clamp-2-jp' : 'line-clamp-2'
  const descTextClass = isJa ? 'text-jp' : 'text-en'

  const greeting =
    new Date().getHours() < 12 ? t('briefing.greeting_morning') : t('briefing.greeting_afternoon')

  const handleReadAll = () => {
    top5.forEach((a) => onMarkAsRead(a.id))
    top5.forEach(() => increment())
  }

  const handleStoryClick = (article: NewsArticle) => {
    onMarkAsRead(article.id)
    increment()
    window.open(article.url, '_blank', 'noopener')
  }

  return (
    <section className="flex flex-col">
      {/* Hero — full-width */}
      <header className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] border-b border-[#1E2530] bg-[#161B22]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="font-body text-sm font-medium uppercase tracking-wider text-gray-500">
            {t('app.name')}
          </p>
          <h1 className="mt-2 font-display text-[18px] font-bold leading-tight text-gray-100 sm:text-[22px]">
            {greeting}
          </h1>
          <p
            className="mt-4 font-display text-xl font-bold tabular-nums text-accent sm:text-2xl"
            aria-live="polite"
          >
            {formatDateAndDay(i18n.language)}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {loading && (
          <p className="mb-4 font-body text-sm text-gray-500">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="ml-2">{t('briefing.updating_briefing')}</span>
          </p>
        )}

        {top5.length === 0 && !loading && (
          <p className="py-12 text-center font-display text-sm text-gray-500">
            {t('briefing.no_stories_yet')}
          </p>
        )}

        {top5.length > 0 && (
          <>
            <ul className="space-y-3" role="list">
              {top5.map((article, i) => {
                const isRead = readIds.has(article.id)
                return (
                  <li
                    key={article.id}
                    className={`animate-briefing-card-in rounded-lg border border-[#1E2530] bg-[#161B22] p-4 transition-[border-color,box-shadow] duration-200 hover:border-accent hover:shadow-[0_0_20px_rgba(0,212,255,0.08)] ${isRead ? 'briefing-card-read' : ''}`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="font-display text-[28px] font-bold tabular-nums text-accent opacity-[0.15]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className={`font-body text-[11px] text-gray-500 opacity-50 ${descTextClass}`}>
                            {typeof article.source === 'string' ? article.source : article.source.name}
                            <span className="mx-1.5">·</span>
                            {formatReadTime(article.readTime ?? 1, locale)}
                          </span>
                        </div>
                        <h2 className={`font-display text-[13px] font-bold leading-snug text-gray-100 sm:text-[15px] ${titleClampClass}`}>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault()
                              handleStoryClick(article)
                            }}
                            className="hover:text-accent focus:text-accent focus:outline-none"
                          >
                            {article.title}
                          </a>
                        </h2>
                        {article.description && (
                          <p className={`mt-1.5 font-body text-xs text-gray-400 opacity-80 ${titleClampClass} ${descTextClass}`} style={{ lineHeight: '1.85' }}>
                            {article.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleReadAll}
                className="rounded-lg border border-[#1E2530] bg-[#161B22] px-4 py-2 font-display text-xs font-medium text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                {t('briefing.read_all')}
              </button>
              <p className="font-body text-xs tabular-nums text-gray-500">
                {lastUpdatedStr}
              </p>
            </div>
          </>
        )}
      </div>

    </section>
  )
}
