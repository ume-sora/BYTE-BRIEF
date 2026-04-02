import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useReadingProgress } from '@/hooks/useReadingProgress'

const LANG_STORAGE_KEY = 'byte-brief-lang'

interface HeaderProps {
  bookmarkCount?: number
  onOpenBookmarks?: () => void
}

const HEADER_TOP_EXTRA = 10

export function Header({ bookmarkCount = 0, onOpenBookmarks }: HeaderProps) {
  const insets = useSafeAreaInsets()
  const { t, i18n } = useTranslation()
  const { dailyCount } = useReadingProgress()

  const setLang = (lng: 'ja' | 'en') => {
    i18n.changeLanguage(lng)
    AsyncStorage.setItem(LANG_STORAGE_KEY, lng)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + HEADER_TOP_EXTRA }]}>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t('app.name')}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={styles.readCount}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {t('briefing.read_count', { count: dailyCount })}
        </Text>
        <View style={styles.langToggle}>
          <Pressable
            onPress={() => setLang('ja')}
            style={[styles.langBtn, i18n.language === 'ja' && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langBtnText,
                i18n.language === 'ja' && styles.langBtnTextActive,
              ]}
            >
              JP
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLang('en')}
            style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langBtnText,
                i18n.language === 'en' && styles.langBtnTextActive,
              ]}
            >
              EN
            </Text>
          </Pressable>
        </View>
        {onOpenBookmarks != null && (
          <Pressable onPress={onOpenBookmarks} style={styles.bookmarkBtn}>
            <Text style={styles.bookmarkCount}>{bookmarkCount}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0D0F14',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2530',
    width: '100%',
  },
  titleWrap: {
    flexShrink: 1,
    minWidth: 0,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D4FF',
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    minWidth: 0,
  },
  readCount: {
    fontSize: 13,
    color: '#9CA3AF',
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  langToggle: {
    flexDirection: 'row',
    flexShrink: 0,
    backgroundColor: '#161B22',
    borderRadius: 9999,
    padding: 2,
    borderWidth: 1,
    borderColor: '#1E2530',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  langBtnActive: {
    backgroundColor: '#00D4FF',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  langBtnTextActive: {
    color: '#000',
  },
  bookmarkBtn: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  bookmarkCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D4FF',
  },
})
