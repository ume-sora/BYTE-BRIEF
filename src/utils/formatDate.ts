function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatAbsoluteFallback(date: Date, locale: string): string {
  const mo = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours()
  const mi = date.getMinutes()
  return locale === 'ja'
    ? `${mo}月${d}日 ${pad2(h)}:${pad2(mi)}`
    : `${mo}/${d} ${pad2(h)}:${pad2(mi)}`
}

/** Hermes / 一部 Android で Intl.RelativeTimeFormat が無い場合があるためフォールバック付き */
export function formatRelativeTime(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return locale === 'ja' ? 'たった今' : 'just now'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 0) {
    return locale === 'ja' ? 'たった今' : 'just now'
  }

  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return locale === 'ja' ? 'たった今' : 'just now'

  const hasRTF =
    typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function'

  if (hasRTF) {
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute')
      if (diffHours < 24) return rtf.format(-diffHours, 'hour')
      if (diffDays < 7) return rtf.format(-diffDays, 'day')
    } catch {
      /* Hermes 等で RelativeTimeFormat が壊れている場合 */
    }
  }

  if (diffMinutes < 60) {
    return locale === 'ja' ? `${diffMinutes}分前` : `${diffMinutes}m ago`
  }
  if (diffHours < 24) {
    return locale === 'ja' ? `${diffHours}時間前` : `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return locale === 'ja' ? `${diffDays}日前` : `${diffDays}d ago`
  }

  if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
    try {
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      /* ignore */
    }
  }

  return formatAbsoluteFallback(date, locale)
}

// Output examples (ja):
// → "たった今", "3分前", "2時間前", "昨日", "3日前", "3月8日 09:30"

export function formatReadTime(minutes: number, locale: string = 'ja'): string {
  if (locale === 'ja') return `約${minutes}分`
  return `${minutes} min read`
}
