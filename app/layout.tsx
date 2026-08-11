import type { Metadata, Viewport } from 'next'
import { M_PLUS_Rounded_1c, Quicksand } from 'next/font/google'
import './globals.css'

const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Study Time',
  description: '自分だけの可愛い勉強スケジュール＆タイマー',
  generator: 'v0.app',
  manifest: 'manifest.webmanifest',
  applicationName: 'Study Time',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Study Time',
  },
  icons: {
    icon: '/app-icon.png',
    apple: '/app-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf6f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${mplusRounded.variable} ${quicksand.variable} bg-background`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
