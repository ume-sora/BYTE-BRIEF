import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { formatReadTime } from '@/utils/formatDate'
import type { Article } from '@/types/news'

interface BriefingCardProps {
  article: Article
  rank: number
  isRead: boolean
  onPress: () => void
}

function sourceName(source: Article['source']): string {
  return typeof source === 'string' ? source : source.name
}

export function BriefingCard({
  article,
  rank,
  isRead,
  onPress,
}: BriefingCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ja' ? 'ja' : 'en'

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isRead && styles.cardRead]}
    >
      <Text style={styles.rank}>{String(rank).padStart(2, '0')}</Text>
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text style={styles.source}>
            {sourceName(article.source)} · {formatReadTime(article.readTime ?? 1, locale)}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {article.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {article.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#161B22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2530',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  cardRead: {
    opacity: 0.5,
  },
  rank: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00D4FF',
    opacity: 0.15,
    marginRight: 12,
    minWidth: 28,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    marginBottom: 6,
  },
  source: {
    fontSize: 11,
    color: '#6B7280',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
})
