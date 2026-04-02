import React, { memo } from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { Article } from '@/types/news'
import { formatRelativeTime, formatReadTime } from '@/utils/formatDate'
import { getArticleSourceDisplay } from '@/utils/articleSource'
import { useTranslation } from 'react-i18next'

const CATEGORY_COLORS: Record<string, string> = {
  ai: '#7B1FA2',
  security: '#C62828',
  cloud: '#1565C0',
  devtools: '#2E7D32',
  startups: '#00838F',
  hardware: '#E65100',
  general: '#37474F',
}

interface NewsCardProps {
  article: Article
  isRead: boolean
  isBookmarked: boolean
  onPress: () => void
  onBookmark: () => void
}

function NewsCard({
  article,
  isRead,
  isBookmarked,
  onPress,
  onBookmark,
}: NewsCardProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ja' ? 'ja' : 'en'
  const badgeColor = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.general
  const { name: sourceName, color: sourceColor } = getArticleSourceDisplay(article)

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isRead && styles.cardRead,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        {article.urlToImage ? (
          <Image
            source={{ uri: article.urlToImage }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnail} />
        )}

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>
                {t(`categories.${article.category}`)}
              </Text>
            </View>
            <Pressable onPress={onBookmark} hitSlop={8}>
              <Feather
                name="bookmark"
                size={16}
                color={isBookmarked ? '#00D4FF' : '#4B5563'}
              />
            </Pressable>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>

          <View style={styles.bottomRow}>
            <View
              style={[
                styles.sourceDot,
                { backgroundColor: sourceColor },
              ]}
            />
            <Text style={styles.meta}>{sourceName}</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.meta}>
              {formatRelativeTime(article.publishedAt, locale)}
            </Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.meta}>
              {formatReadTime(article.readTime, locale)}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#161B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2530',
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 12,
    gap: 12,
  },
  cardRead: {
    opacity: 0.4,
  },
  cardPressed: {
    borderColor: '#00D4FF',
    transform: [{ scale: 0.985 }],
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#1E2530',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  meta: {
    color: '#6B7280',
    fontSize: 11,
  },
  metaDivider: {
    color: '#374151',
    fontSize: 11,
  },
})

export default memo(NewsCard)
