/**
 * Placeholder card with same dimensions as NewsCard and animated gray shimmer.
 */
export function SkeletonCard() {
  return (
    <article
      className="relative flex gap-3 rounded-lg border border-[#1E2530] p-3"
      style={{ backgroundColor: '#161B22' }}
    >
      <div className="h-20 w-20 shrink-0 rounded-md skeleton-shimmer" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-24 rounded skeleton-shimmer" />
          <span className="h-3 w-12 rounded skeleton-shimmer" />
        </div>
        <span className="inline-block h-4 w-14 rounded border border-[#1E2530] skeleton-shimmer" />
        <div className="space-y-1">
          <div className="h-4 w-full max-w-[90%] rounded skeleton-shimmer" />
          <div className="h-4 w-full max-w-[70%] rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-1 pt-0.5">
          <div className="h-3 w-full rounded skeleton-shimmer" />
          <div className="h-3 w-[80%] rounded skeleton-shimmer" />
        </div>
      </div>
    </article>
  )
}
