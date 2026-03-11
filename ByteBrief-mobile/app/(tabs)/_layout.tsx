import { Tabs } from 'expo-router'
import { Feather } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0F14',
          borderTopColor: '#1E2530',
        },
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: '#4B5563',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ブリーフィング',
          tabBarIcon: ({ color, size }) => (
            <Feather name="sun" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'フィード',
          tabBarIcon: ({ color, size }) => (
            <Feather name="rss" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: '保存済み',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
