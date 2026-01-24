import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Corefy - 폼만 작성하면 웹사이트 완성',
  description: '드래그앤드롭 없는 AI 웹빌더. 온라인 강의, 멘토링, 컨설팅을 30분 만에 판매 시작하세요.',
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
