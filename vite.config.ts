import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { RSS_SOURCES } from './src/api/rssFeeds'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 開発時は /rss-proxy/<source.id> を各フィードへ中継する（CORS 回避）
const rssProxy = Object.fromEntries(
  RSS_SOURCES.map((source) => {
    const feedUrl = new URL(source.url)
    return [
      `^/rss-proxy/${source.id}$`,
      {
        target: feedUrl.origin,
        changeOrigin: true,
        rewrite: () => feedUrl.pathname + feedUrl.search,
      },
    ]
  })
)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: rssProxy,
  },
})
