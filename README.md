# Study Time — 勉強スケジュール＆タイマー

自分1人だけで使う、可愛い勉強スケジュール＆タイマーアプリです。データはすべてブラウザ内（LocalStorage）に保存されるので、サーバーもログインも不要。GitHub Pages のような静的ホスティングにそのまま置けます。

## 主な機能

- 🗓️ **カレンダー**: 月間カレンダーに科目アイコン付きで予定を追加／削除。予定をタップするとその科目のタイマーへ移動。
- ⏰ **タイマー**: 好きな画像（推しの写真など）をアップロードして表示。作動中はキラキラ＆ゆっくり回転アニメーション。リロードしても時間が進み続けます。
- 📊 **きろく**: 今日の合計勉強時間・科目別の内訳・直近7日間のグラフを表示。
- 📱 **ホーム画面に追加**（PWA）: iPad / iPhone でSafariのシェアメニューからホームにＥ追加すると全画面アプリのように使えます。

## GitHub Pages で公開する方法

### かんたん（自動デプロイ）

1. このコードを GitHub リポジトリに push します。
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に変更します。
3. `main` ブランチに push すると `.github/workflows/deploy.yml` が自動でビルド＆公開します。
   - `username.github.io/リポジトリ名` の形でも、`username.github.io`（トップ）の形でも、リポジトリ名から自動で正しいパスを設定します。

### 手動でビルドする場合

```bash
pnpm install
# username.github.io/リポジトリ名 で公開するなら:
NEXT_PUBLIC_BASE_PATH=/リポジトリ名 pnpm build
# username.github.io（トップ）や Vercel なら:
pnpm build
```

`out/` フォルダの中身が完成した静的サイトです。GitHub Pages / Netlify / Cloudflare Pages などにそのままアップロードできます。

## iPad（第10世代）での使い方

1. Safari で公開URLを開く
2. 共有ボタン（□に↑）→「ホーム画面に追加」
3. ホーム画面のアイコンから起動すると全画面で使えます

## 技術

Next.js 16（静的エクスポート）/ React 19 / Tailwind CSS v4。バックエンド不要。
