import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SearchBar } from '@/components/SearchBar'
import { NewsCard } from '@/components/NewsCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { VirtualizedFeed } from '@/components/VirtualizedFeed'
import { BriefingView } from '@/components/BriefingView'
import { BookmarkDrawer } from '@/components/BookmarkDrawer'
import { useNews } from '@/hooks/useNews'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useReadingProgress } from '@/hooks/useReadingProgress'

export default function App() {
  const { t } = useTranslation()
  const [bookmarkDrawerOpen, setBookmarkDrawerOpen] = useState(false)
  const {
    articles,
    viewMode,
    selectedCategory,
    searchQuery,
    readIds,
    lastUpdated,
    loading,
    hasMore,
    error,
    setViewMode,
    setSelectedCategory,
    setSearchQuery,
    markAsRead,
    clearError,
    loadMore,
    refresh,
  } = useNews()
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarkCount = bookmarks.size
  const { increment } = useReadingProgress()

  const handleRead = useCallback(
    (id: string, url: string) => {
      markAsRead(id)
      increment()
      window.open(url, '_blank', 'noopener')
    },
    [markAsRead, increment]
  )

  const handleBookmark = useCallback(
    (id: string, details: { title: string; url: string; source?: string }) => {
      toggleBookmark(id, details)
    },
    [toggleBookmark]
  )

  return (
    <div className="min-h-screen bg-bg">
      <Header
        onOpenBookmarks={() => setBookmarkDrawerOpen(true)}
        bookmarkCount={bookmarkCount}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-surface p-1">
            <button
              type="button"
              onClick={() => setViewMode('briefing')}
              className={`rounded-md px-3 py-2 font-display text-xs font-medium transition-colors ${
                viewMode === 'briefing' ? 'bg-accent text-bg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('briefing.today_briefing')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`rounded-md px-3 py-2 font-display text-xs font-medium transition-colors ${
                viewMode === 'feed' ? 'bg-accent text-bg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('briefing.feed')}
            </button>
          </div>
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="shrink-0 rounded-lg bg-surface px-3 py-2 text-xs text-gray-400 transition hover:bg-surface/80 hover:text-accent disabled:opacity-50"
          >
            {loading ? t('actions.loading') : t('actions.refresh')}
          </button>
        </div>

        {viewMode === 'feed' && (
          <div className="mb-4">
            <CategoryFilter activeCategory={selectedCategory} onChange={setSelectedCategory} />
          </div>
        )}

        {error && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-red-200">{error.message}</p>
            <button
              type="button"
              onClick={() => {
                clearError()
                refresh()
              }}
              className="shrink-0 rounded-lg bg-red-500/20 px-3 py-2 font-display text-xs font-medium text-red-200 transition hover:bg-red-500/30"
            >
              {t('actions.retry')}
            </button>
          </div>
        )}

        {viewMode === 'briefing' ? (
          <BriefingView
            articles={articles}
            readIds={readIds}
            lastUpdated={lastUpdated}
            loading={loading}
            onMarkAsRead={markAsRead}
          />
        ) : (
          <>
            {loading && articles.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-1">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : articles.length > 50 ? (
              <div className="grid gap-4 sm:grid-cols-1" style={{ minHeight: 400 }}>
                <VirtualizedFeed
                  articles={articles}
                  readIds={readIds}
                  isBookmarked={isBookmarked}
                  onRead={handleRead}
                  onBookmark={handleBookmark}
                  listHeight={Math.min(600, typeof window !== 'undefined' ? window.innerHeight - 220 : 600)}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1">
                {articles.map((article, i) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isRead={readIds.has(article.id)}
                    isBookmarked={isBookmarked(article.id)}
                    onRead={handleRead}
                    onBookmark={handleBookmark}
                    animationDelay={i * 50}
                  />
                ))}
              </div>
            )}
            {articles.length === 0 && !loading && (
              <p className="py-12 text-center text-sm text-gray-500">{t('actions.no_articles_match')}</p>
            )}
            {loading && articles.length > 0 && (
              <p className="py-6 text-center text-sm text-gray-500">{t('actions.loading')}</p>
            )}
            {hasMore && articles.length > 0 && !loading && viewMode === 'feed' && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="rounded-lg bg-surface px-4 py-2 font-display text-sm text-accent transition hover:bg-surface/80"
                >
                  {t('actions.load_more')}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <BookmarkDrawer open={bookmarkDrawerOpen} onClose={() => setBookmarkDrawerOpen(false)} />
    </div>
  )
}
