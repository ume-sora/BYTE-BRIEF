import { useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'

export default function ArticleScreen() {
  const { url } = useLocalSearchParams<{ url: string }>()
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)

  if (!url) {
    return null
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#00D4FF" />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#00D4FF" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0F14',
  },
})
