import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobsClass - AI 지식 마켓플레이스',
  description: '전문성과 영향력을 가진 크리에이터가 파트너로 참여하는 지식 마켓플레이스. 온라인 강의, 멘토링, 컨설팅을 AI로 3분 만에 등록하고 판매하세요.',
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
