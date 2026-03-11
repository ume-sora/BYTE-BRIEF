import { useCallback } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Header } from '@/components/Header'

export default function BookmarksScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { bookmarkedList, toggleBookmark, bookmarks } = useBookmarks()

  const handleOpen = useCallback(
    (url: string) => {
      router.push({ pathname: '/article', params: { url } })
    },
    [router]
  )

  return (
    <View style={styles.container}>
      <Header bookmarkCount={bookmarks.size} />
      {bookmarkedList.length === 0 ? (
        <Text style={styles.empty}>{t('actions.bookmarks_empty')}</Text>
      ) : (
        <FlatList
          data={bookmarkedList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                onPress={() => handleOpen(item.url)}
                style={styles.link}
              >
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => toggleBookmark(item.id)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F14' },
  list: { padding: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#161B22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2530',
    marginBottom: 8,
  },
  link: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  removeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  removeText: {
    fontSize: 16,
    color: '#F87171',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
})
