/** @type {import('next').NextConfig} */

// GitHub Pages で `username.github.io/リポジトリ名` に公開する場合は、
// 環境変数 NEXT_PUBLIC_BASE_PATH に "/リポジトリ名" を設定してください。
// 例: NEXT_PUBLIC_BASE_PATH=/study-time
// トップ (username.github.io) や Vercel の場合は空のままでOKです。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  // GitHub Pages 用に完全な静的サイトとして書き出します
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
