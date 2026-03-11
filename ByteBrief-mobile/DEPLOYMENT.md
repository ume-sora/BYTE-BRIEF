# デプロイ手順書 — BYTE BRIEF
## Android先行リリース版（iOS対応は将来予定）

---

## 前提条件チェックリスト

### 今すぐ必要なもの（Android）
- [ ] Expo アカウント作成済み（https://expo.dev）
- [ ] EAS CLI インストール済み（`npm install -g eas-cli`）
- [ ] Google Play Console 登録済み（初回 $25）
- [ ] `app.json` の `android.package` を自社ドメインに変更済み
      例: "com.yourcompany.bytebrief" → "com.tanaka.bytebrief"
- [ ] アセット画像を用意済み（下記参照）
- [ ] プライバシーポリシーページを公開済み（必須）

### 将来iOSに対応するとき（現時点では不要）
- [ ] Apple Developer Program 登録（年間 $99）
- [ ] App Store Connect でアプリ作成
- [ ] eas.json の ios submit ブロックを有効化
- [ ] app.json に "ios" ブロックを復元
- [ ] package.json の _DISABLED スクリプトを有効化

---

## 必要なアセット画像

| ファイル | サイズ | 用途 |
|---|---|---|
| `assets/icon.png` | 1024×1024 px | アプリアイコン（Android / 将来のiOS共用） |
| `assets/splash.png` | 1284×2778 px | スプラッシュ画面 |
| `assets/adaptive-icon.png` | 1024×1024 px | Android アダプティブアイコン（透過PNG可）|
| `assets/notification-icon.png` | 96×96 px | 通知アイコン（白・透過背景） |

> 作成ツール: https://appicon.co（無料）または Figma

---

## Android 配信手順

### Step 1: Google Play Console でアプリを作成
1. https://play.google.com/console にアクセス
2. 「アプリを作成」→ アプリ名「バイトブリーフ」を入力
3. 「内部テスト」トラックを選択して開始

### Step 2: サービスアカウントキーを取得
1. Play Console → 設定 → API アクセス
2. 「サービスアカウントを作成」をクリック
3. Google Cloud Console でキー（JSON）をダウンロード
4. プロジェクトルートに `google-play-service-account.json` として保存
5. .gitignore に追加（絶対にGitにコミットしないこと）
```bash
echo "google-play-service-account.json" >> .gitignore
```

### Step 3: EAS プロジェクトに紐付け
```bash
eas login
eas build:configure   # 初回のみ — EAS Project IDが生成される
# 生成されたProject IDをapp.jsonのextra.eas.projectIdに記入
```

### Step 4: 動作確認ビルド（APK）
```bash
pnpm build:preview
# 内部テスト用APKが生成される（約10〜15分）
# QRコードからAndroid実機に直接インストール可能
```

### Step 5: 本番ビルド（AAB）
```bash
pnpm build:android
# Google Play提出用 App Bundle が生成される（約15〜20分）
```

### Step 6: Play Console に提出
```bash
pnpm submit:android
# production トラックに自動アップロード
```

### Step 7: ストア掲載情報を入力（Play Console）
store-metadata.md の「Google Play Store」セクションをコピペ:
- タイトル・説明文を貼り付け
- スクリーンショットを最低2枚アップロード（シミュレーターで撮影可）
- プライバシーポリシーURLを入力

### Step 8: リリース審査へ提出
内部テスト → クローズドテスト → 本番リリース の順で進める
※ 初回審査は最大7営業日かかることあり

---

## OTA アップデート（コード修正時）
JS・アセットの変更はストア審査なしで即時反映:
```bash
pnpm update "バグ修正・パフォーマンス改善"
```
※ native コード（app.json / plugins）変更時は再ビルドが必要

---

## 将来 iOS に対応するときの手順（メモ）
1. Apple Developer Program に登録（年間 $99）
2. App Store Connect でアプリを新規作成
3. eas.json の ios submit ブロックのコメントを外す
4. app.json の "_ios_*" キーを "ios" ブロックとして正式に復元
5. package.json の "_DISABLED" スクリプトをリネーム
6. `pnpm build:ios` → `pnpm submit:ios`

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| `eas build` がエラー | EAS Project IDが未設定 | app.jsonのprojectIdを確認 |
| Play Consoleにアップロードできない | サービスアカウントの権限不足 | Play Console→APIアクセスで権限を付与 |
| 通知が届かない | 初回起動時の権限リクエストを拒否 | 設定→アプリ→通知から手動で許可 |
| RSSが取得できない | フィードURLが変更された | src/api/rssFeeds.tsのURLを更新してOTA配信 |
| ビルドは成功するがクラッシュする | フォントファイルが存在しない | assets/fonts/に4つのttfファイルを配置 |

