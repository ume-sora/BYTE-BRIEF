import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useBookmarks, type BookmarkDetails } from '@/hooks/useBookmarks'
import { Header } from '@/components/Header'

const SORT_STORAGE_KEY = 'byte-brief-bookmarks-sort'
const SORT_BAR_HEIGHT = 56

type BookmarkSortMode =
  | 'added_desc'
  | 'added_asc'
  | 'title_gojuon_asc'

const SORT_OPTIONS: { mode: BookmarkSortMode; labelKey: string }[] = [
  { mode: 'added_desc', labelKey: 'actions.bookmarks_sort_newest' },
  { mode: 'added_asc', labelKey: 'actions.bookmarks_sort_oldest' },
  { mode: 'title_gojuon_asc', labelKey: 'actions.bookmarks_sort_gojuon_asc' },
]

const CATEGORY_COLORS: Record<string, string> = {
  ai: '#7B1FA2',
  security: '#C62828',
  cloud: '#1565C0',
  devtools: '#2E7D32',
  startups: '#00838F',
  hardware: '#E65100',
  general: '#37474F',
}

function normalizeSortMode(v: string | null): BookmarkSortMode {
  // Backward compatibility for older stored values.
  switch (v) {
    case 'added_desc':
      return 'added_desc'
    case 'added_asc':
      return 'added_asc'
    case 'title_asc':
      return 'title_gojuon_asc'
    case 'title_desc':
      return 'title_gojuon_asc'
    case 'title_gojuon_asc':
      return 'title_gojuon_asc'
    case 'title_gojuon_desc':
      return 'title_gojuon_asc'
    default:
      return 'added_desc'
  }
}

type BookmarkRow = { id: string } & BookmarkDetails

function sortBookmarkedList(
  list: BookmarkRow[],
  mode: BookmarkSortMode,
  locale: string
): BookmarkRow[] {
  const copy = [...list]
  const jaCollator = new Intl.Collator('ja', { sensitivity: 'base' })
  const collator = new Intl.Collator(locale === 'ja' ? 'ja' : 'en', {
    sensitivity: 'base',
  })
  switch (mode) {
    case 'added_desc':
      return copy.reverse()
    case 'added_asc':
      return copy
    case 'title_gojuon_asc':
      return copy.sort((a, b) => jaCollator.compare(a.title, b.title))
    default:
      return copy
  }
}

export default function BookmarksScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { bookmarkedList, toggleBookmark, bookmarks } = useBookmarks()
  const [sortMode, setSortMode] = useState<BookmarkSortMode>('added_desc')
  const [sortHydrated, setSortHydrated] = useState(false)
  const [sortModalVisible, setSortModalVisible] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(SORT_STORAGE_KEY).then((raw) => {
      setSortMode(normalizeSortMode(raw))
      setSortHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!sortHydrated) return
    void AsyncStorage.setItem(SORT_STORAGE_KEY, sortMode)
  }, [sortMode, sortHydrated])

  const sortedList = useMemo(
    () =>
      sortBookmarkedList(
        bookmarkedList,
        sortMode,
        i18n.language === 'ja' ? 'ja' : 'en'
      ),
    [bookmarkedList, sortMode, i18n.language]
  )

  const activeSortOption = useMemo(
    () => SORT_OPTIONS.find((o) => o.mode === sortMode),
    [sortMode]
  )

  const handleOpen = useCallback(
    (url: string) => {
      router.push({ pathname: '/article', params: { url } })
    },
    [router]
  )

  const closeSortModal = useCallback(() => setSortModalVisible(false), [])

  return (
    <View style={styles.container}>
      <Header bookmarkCount={bookmarks.size} />
      {bookmarkedList.length === 0 ? (
        <Text style={styles.empty}>{t('actions.bookmarks_empty')}</Text>
      ) : (
        <>
          <View style={styles.sortBar}>
            <Pressable
              onPress={() => setSortModalVisible(true)}
              style={styles.sortButton}
            >
              <Text style={styles.sortButtonText}>
                {activeSortOption ? t(activeSortOption.labelKey) : ''}
              </Text>
            </Pressable>
          </View>

          <Modal
            visible={sortModalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeSortModal}
          >
            <Pressable style={styles.modalOverlay} onPress={closeSortModal}>
              <View style={styles.modalSheet}>
                {SORT_OPTIONS.map(({ mode, labelKey }) => {
                  const isActive = sortMode === mode
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => {
                        setSortMode(mode)
                        closeSortModal()
                      }}
                      style={[
                        styles.modalOption,
                        isActive && styles.modalOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          isActive && styles.modalOptionTextActive,
                        ]}
                      >
                        {t(labelKey)}
                      </Text>
                      {isActive && <Text style={styles.checkMark}>✓</Text>}
                    </Pressable>
                  )
                })}

                <Pressable onPress={closeSortModal} style={styles.modalCloseRow}>
                  <Text style={styles.modalCloseText}>{t('actions.close')}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          <FlatList
            style={styles.listFlex}
            data={sortedList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Pressable
                  onPress={() => handleOpen(item.url)}
                  style={styles.link}
                >
                  {!!item.category && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.general,
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {t(`categories.${item.category}`)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleBookmark(item.id)}
                  style={styles.bookmarkBtn}
                  hitSlop={8}
                >
                  <Feather name="bookmark" size={18} color="#00D4FF" />
                </Pressable>
              </View>
            )}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F14' },
  sortBar: {
    height: SORT_BAR_HEIGHT,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2530',
    backgroundColor: '#0D0F14',
  },
  sortButton: {
    flex: 1,
    height: SORT_BAR_HEIGHT,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D4FF',
  },
  listFlex: { flex: 1 },
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  bookmarkBtn: {
    padding: 8,
    marginLeft: 8,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#161B22',
    paddingTop: 12,
    paddingBottom: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2530',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalOptionActive: {
    backgroundColor: '#00D4FF20',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  modalOptionTextActive: {
    color: '#00D4FF',
  },
  checkMark: {
    fontSize: 16,
    color: '#00D4FF',
    fontWeight: '700',
  },
  modalCloseRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCloseText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
})
