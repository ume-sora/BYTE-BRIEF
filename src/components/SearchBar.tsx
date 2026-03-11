import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const DEBOUNCE_MS = 300

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('actions.search_placeholder')
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    const t = setTimeout(() => {
      onChange(local)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [local, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value)
  }, [])

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={local}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        className="w-full rounded-lg border border-surface bg-surface py-2.5 pl-10 pr-4 font-body text-sm text-gray-200 placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label={t('actions.search_articles')}
      />
    </div>
  )
}
