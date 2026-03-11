import React from 'react'
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat}
          onPress={() => onChange(cat)}
          style={[
            styles.tab,
            activeCategory === cat && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeCategory === cat && styles.tabTextActive,
              !isJa && styles.tabTextUppercase,
            ]}
          >
            {t(CATEGORY_I18N_KEYS[cat] ?? cat)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  scrollContent: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: '#00D4FF',
    borderRadius: 4,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#000',
  },
  tabTextUppercase: {
    textTransform: 'uppercase',
  },
})
