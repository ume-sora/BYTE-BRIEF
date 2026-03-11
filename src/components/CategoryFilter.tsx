import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const CATEGORIES = [
  'general',
  'AI',
  'Security',
  'Cloud',
  'Dev Tools',
  'Startups',
  'Hardware',
] as const

const CATEGORY_I18N_KEYS: Record<string, string> = {
  general: 'categories.all',
  AI: 'categories.ai',
  Security: 'categories.security',
  Cloud: 'categories.cloud',
  'Dev Tools': 'categories.devtools',
  Startups: 'categories.startups',
  Hardware: 'categories.hardware',
}

interface CategoryFilterProps {
  activeCategory: string
  onChange: (category: string) => void
}

export function CategoryFilter({ activeCategory, onChange }: CategoryFilterProps) {
  const { t, i18n } = useTranslation()
  const isJa = i18n.language === 'ja'
  const navRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [underline, setUnderline] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const index = CATEGORIES.indexOf(activeCategory as (typeof CATEGORIES)[number])
    if (index === -1) return
    const el = tabRefs.current[index]
    const container = navRef.current
    if (!el || !container) return
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setUnderline({
      left: elRect.left - containerRect.left + container.scrollLeft,
      width: elRect.width,
    })
  }, [activeCategory])

  return (
    <nav
      ref={navRef}
      className="category-filter-scroll relative flex overflow-x-auto overflow-y-hidden pb-1"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      aria-label="Filter by category"
    >
      <div className="flex min-w-max gap-0">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            ref={(el) => { tabRefs.current[i] = el }}
            type="button"
            onClick={() => onChange(cat)}
            className={`shrink-0 px-4 py-3 font-display text-[10px] font-semibold tracking-[0.08em] transition-colors ${isJa ? '' : 'uppercase'} ${
              activeCategory === cat
                ? 'bg-[#00D4FF] text-black'
                : 'bg-transparent text-[#6B7280] hover:text-white'
            }`}
          >
            {t(CATEGORY_I18N_KEYS[cat] ?? cat)}
          </button>
        ))}
      </div>
      <span
        className="absolute bottom-0 h-0.5 bg-[#00D4FF] transition-all duration-300 ease-out"
        style={{
          left: underline.left,
          width: underline.width,
        }}
        aria-hidden
      />
    </nav>
  )
}
