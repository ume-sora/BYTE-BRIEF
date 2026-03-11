export function formatRelativeTime(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffSeconds < 60) return locale === 'ja' ? 'たった今' : 'just now'
  if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute')
  if (diffHours < 24) return rtf.format(-diffHours, 'hour')
  if (diffDays < 7) return rtf.format(-diffDays, 'day')

  // 1週間以上前は絶対日付で表示
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Output examples (ja):
// → "たった今", "3分前", "2時間前", "昨日", "3日前", "3月8日 09:30"

export function formatReadTime(minutes: number, locale: string = 'ja'): string {
  if (locale === 'ja') return `約${minutes}分`
  return `${minutes} min read`
}
