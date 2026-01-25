import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '잡스빌드 - 1클릭으로 웹사이트 완성',
  description: 'AI가 자동으로 만드는 전문가급 웹사이트. 온라인 강의, 멘토링, 컨설팅을 10분 만에 시작하세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
