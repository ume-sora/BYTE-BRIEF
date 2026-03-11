import { useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useNews } from '@/hooks/useNews'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useTranslation } from 'react-i18next'
import { useBookmarks } from '@/hooks/useBookmarks'
import NetInfo from '@react-native-community/netinfo'
import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { CategoryFilter } from '@/components/CategoryFilter'
import NewsCard from '@/components/NewsCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { OfflineBanner } from '@/components/OfflineBanner'
import { useNewsStore } from '@/store/newsStore'

export default function FeedScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { selectedCategory, setSelectedCategory } = useNewsStore()
  const {
    articles,
    loading,
    refresh,
    readIds,
    markAsRead,
    error,
  } = useNews({ categoryFilter: selectedCategory })
  const { isBookmarked, toggleBookmark, bookmarks } = useBookmarks()
  const { increment } = useReadingProgress()
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false)
    })
    return () => sub()
  }, [])

  const handleRead = useCallback(
    (id: string, url: string) => {
      markAsRead(id)
      increment()
      router.push({ pathname: '/article', params: { url } })
    },
    [markAsRead, increment, router]
  )

  const handleBookmark = useCallback(
    (id: string, details: { title: string; url: string; source?: string }) => {
      toggleBookmark(id, details)
    },
    [toggleBookmark]
  )

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof articles)[0]; index: number }) => (
      <NewsCard
        article={item}
        index={index}
        isRead={readIds.has(item.id)}
        isBookmarked={isBookmarked(item.id)}
        onPress={() => handleRead(item.id, item.url)}
        onBookmark={() =>
          handleBookmark(item.id, {
            title: item.title,
            url: item.url,
            source: item.source.name,
          })
        }
      />
    ),
    [readIds, isBookmarked, handleRead, handleBookmark]
  )

  if (loading && articles.length === 0) {
    return (
      <View style={styles.container}>
        <Header bookmarkCount={bookmarks.size} />
        <CategoryFilter activeCategory={selectedCategory} onChange={setSelectedCategory} />
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header bookmarkCount={bookmarks.size} />
      {isOffline && <OfflineBanner />}
      <CategoryFilter activeCategory={selectedCategory} onChange={setSelectedCategory} />
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#00D4FF" />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{t('actions.no_articles_match')}</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F14' },
  list: { padding: 16, gap: 12 },
  listContent: { paddingBottom: 24 },
  separator: { height: 8 },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
})
