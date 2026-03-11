# BYTE BRIEF

テック業界向けのダークテーマの朝刊型 IT ニュースダッシュボードです。出勤前に主要ニュースをさっと確認できます。

## 技術スタック

- **フロントエンド:** React 18 + TypeScript + Vite
- **スタイル:** Tailwind CSS
- **データ:** NewsAPI.org（API キー未設定時はモックデータで動作）
- **状態管理:** Zustand
- **パッケージマネージャ:** pnpm（または npm）

## 主な機能

- **ニュースフィード** — カテゴリフィルタ（AI・セキュリティ・クラウド・Dev Tools・スタートアップ・ハードウェア）、既読マーク、続きを読み込み
- **Today's Briefing** — トップ5記事、30分ごとの自動更新、最終更新時刻表示
- **検索** — 読み込み済み記事の全文検索（300ms デバウンス）
- **ブックマーク** — 記事を保存、localStorage に永続化、サイドドロワーで表示
- **読了カウント** — 「今日 N 件読んだ」表示、0時でリセット（localStorage + 日付）

## セットアップ

1. **依存関係のインストール**

   ```bash
   pnpm install
   # または: npm install
   ```

2. **（任意）NewsAPI キーの設定**

   [newsapi.org](https://newsapi.org) でキーを取得し、`.env.example` をコピーして `.env` を作成し、キーを設定してください。未設定の場合はモックデータで動作します。

   ```bash
   cp .env.example .env
   ```

3. **開発サーバーの起動**

   ```bash
   pnpm dev
   # または: npm run dev
   ```

4. **ビルド**

   ```bash
   pnpm build
   npm run preview  # 本番ビルドのプレビュー
   ```

## プロジェクト構成

```
src/
├── components/   # Header, NewsCard, CategoryFilter, BriefingView, SearchBar, BookmarkDrawer
├── hooks/        # useNews, useBookmarks, useReadingProgress
├── api/          # newsApi.ts（NewsAPI + モック）
├── store/        # newsStore.ts（Zustand）
├── types/        # news.ts
└── App.tsx
```

## デザイン

- **テーマ:** ダーク — 背景 `#0D0F14`、カード `#161B22`、アクセント `#00D4FF`
- **フォント:** Space Mono（見出し）、Inter（本文）
- **UI:** カードのスタッガーアニメーション、ホバー時のグロー、デスクトップ・タブレット対応
