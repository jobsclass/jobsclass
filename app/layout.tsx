import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobsClass - AI 기반 지식 마켓플레이스',
  description: 'AI 기반 지식 마켓플레이스. 판매자는 AI로 콘텐츠 제작, 구매자는 AI 상담으로 맞춤 추천. 온라인 강의, 멘토링, 컨설팅을 3분 만에 시작하세요.',
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
