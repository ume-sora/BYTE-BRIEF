import React from 'react'
import { View, StyleSheet } from 'react-native'

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={[styles.thumb, styles.shimmer]} />
      <View style={styles.content}>
        <View style={[styles.line, styles.shimmer, { width: '60%' }]} />
        <View style={[styles.line, styles.shimmer, { width: '40%' }]} />
        <View style={[styles.badge, styles.shimmer]} />
        <View style={[styles.line, styles.shimmer, { width: '90%' }]} />
        <View style={[styles.line, styles.shimmer, { width: '70%' }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#161B22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2530',
    gap: 12,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#1E2530',
  },
  content: { flex: 1, gap: 8 },
  line: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#1E2530',
  },
  badge: {
    height: 16,
    width: 56,
    borderRadius: 4,
    backgroundColor: '#1E2530',
  },
  shimmer: {
    opacity: 0.7,
  },
})
