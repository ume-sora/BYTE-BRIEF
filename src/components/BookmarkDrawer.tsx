import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBookmarks } from '@/hooks/useBookmarks'

interface BookmarkDrawerProps {
  open: boolean
  onClose: () => void
}

export function BookmarkDrawer({ open, onClose }: BookmarkDrawerProps) {
  const { t } = useTranslation()
  const { bookmarkedList, toggleBookmark } = useBookmarks()

  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label={t('actions.close')}
      />
      <aside
        className="bookmark-drawer-panel fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#1E2530] bg-[#161B22] shadow-xl sm:w-96"
        aria-label={t('actions.bookmarks_title')}
      >
        <div className="flex items-center justify-between border-b border-[#1E2530] px-4 py-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#00D4FF]">
            {t('actions.bookmarks_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-gray-500 transition hover:bg-[#1E2530] hover:text-white"
            aria-label={t('actions.close')}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {bookmarkedList.length === 0 ? (
            <p className="py-8 text-center font-body text-sm text-gray-500">
              {t('actions.bookmarks_empty')}
            </p>
          ) : (
            <ul className="space-y-2">
              {bookmarkedList.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-[#1E2530] bg-[#0D0F14] p-3"
                >
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 font-display text-xs font-medium leading-snug text-gray-200 hover:text-[#00D4FF]"
                  >
                    {entry.title}
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(entry.id)}
                    className="shrink-0 rounded p-1 text-gray-500 hover:text-red-400"
                    aria-label={t('actions.remove_bookmark')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
