import { useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useNews } from '@/hooks/useNews'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Header } from '@/components/Header'
import { BriefingCard } from '@/components/BriefingCard'
import { SkeletonCard } from '@/components/SkeletonCard'

export default function BriefingScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { articles, loading, refresh, readIds, markAsRead } = useNews()
  const { increment } = useReadingProgress()
  const { bookmarks } = useBookmarks()
  const top5 = articles.slice(0, 5)
  const greeting =
    new Date().getHours() < 12
      ? t('briefing.greeting_morning')
      : t('briefing.greeting_afternoon')

  const handleArticlePress = useCallback(
    (id: string, url: string) => {
      markAsRead(id)
      increment()
      router.push({ pathname: '/article', params: { url } })
    },
    [markAsRead, increment, router]
  )

  return (
    <View style={styles.container}>
      <Header bookmarkCount={bookmarks.size} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#00D4FF"
          />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{t('app.name')}</Text>
          <Text style={styles.heroTitle}>{greeting}</Text>
          <Text style={styles.heroDate}>
            {new Date().toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {loading && top5.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : top5.length === 0 ? (
          <Text style={styles.empty}>{t('briefing.no_stories_yet')}</Text>
        ) : (
          <View style={styles.list}>
            {top5.map((article, i) => (
              <BriefingCard
                key={article.id}
                article={article}
                rank={i + 1}
                isRead={readIds.has(article.id)}
                onPress={() => handleArticlePress(article.id, article.url)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F14' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  hero: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2530',
    backgroundColor: '#161B22',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 8,
  },
  heroDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D4FF',
    marginTop: 12,
  },
  list: { padding: 16 },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
})
