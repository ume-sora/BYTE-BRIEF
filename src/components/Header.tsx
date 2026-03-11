import { useTranslation } from 'react-i18next'
import { useReadingProgress } from '@/hooks/useReadingProgress'

const LANG_STORAGE_KEY = 'byte-brief-lang'

interface HeaderProps {
  onOpenBookmarks: () => void
  bookmarkCount: number
}

export function Header({ onOpenBookmarks, bookmarkCount }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const { dailyCount } = useReadingProgress()

  const setLang = (lng: 'ja' | 'en') => {
    i18n.changeLanguage(lng)
    localStorage.setItem(LANG_STORAGE_KEY, lng)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-surface bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <h1 className="font-display text-lg font-bold tracking-tight text-accent sm:text-xl">
          {t('app.name')}
        </h1>
        <div className="flex items-center gap-4 font-body text-sm text-gray-400">
          <span className="hidden sm:inline">
            {t('briefing.read_count', { count: dailyCount })}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-[#1E2530] bg-[#161B22] p-0.5 font-display text-xs font-medium">
              <button
                type="button"
                onClick={() => setLang('ja')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  i18n.language === 'ja' ? 'bg-[#00D4FF] text-black' : 'text-[#6B7280] hover:text-gray-300'
                }`}
              >
                JP
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  i18n.language === 'en' ? 'bg-[#00D4FF] text-black' : 'text-[#6B7280] hover:text-gray-300'
                }`}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-surface hover:text-accent"
              aria-label={t('actions.open_bookmarks')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">{bookmarkCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
