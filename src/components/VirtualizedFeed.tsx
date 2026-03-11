import { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import type { NewsArticle } from '@/types/news'
import { NewsCard } from './NewsCard'

const ROW_HEIGHT = 176
const INITIAL_LIST_HEIGHT = 600

export interface VirtualizedFeedProps {
  articles: NewsArticle[]
  readIds: Set<string>
  isBookmarked: (id: string) => boolean
  onRead: (id: string, url: string) => void
  onBookmark: (id: string, details: { title: string; url: string; source?: string }) => void
  listHeight?: number
  itemHeight?: number
}

interface RowData {
  articles: NewsArticle[]
  readIds: Set<string>
  isBookmarked: (id: string) => boolean
  onRead: (id: string, url: string) => void
  onBookmark: (id: string, details: { title: string; url: string; source?: string }) => void
}

function FeedRow({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: RowData
}) {
  const { articles, readIds, isBookmarked, onRead, onBookmark } = data
  const article = articles[index]
  if (!article) return null
  return (
    <div style={style}>
      <NewsCard
        article={article}
        isRead={readIds.has(article.id)}
        isBookmarked={isBookmarked(article.id)}
        onRead={onRead}
        onBookmark={onBookmark}
        animationDelay={index * 50}
      />
    </div>
  )
}

export function VirtualizedFeed({
  articles,
  readIds,
  isBookmarked,
  onRead,
  onBookmark,
  listHeight = INITIAL_LIST_HEIGHT,
  itemHeight = ROW_HEIGHT,
}: VirtualizedFeedProps) {
  const itemData = useMemo<RowData>(
    () => ({
      articles,
      readIds,
      isBookmarked,
      onRead,
      onBookmark,
    }),
    [articles, readIds, isBookmarked, onRead, onBookmark]
  )

  return (
    <List
      height={listHeight}
      itemCount={articles.length}
      itemSize={itemHeight}
      width="100%"
      itemData={itemData}
    >
      {FeedRow}
    </List>
  )
}
