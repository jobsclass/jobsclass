import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobsClass - AI 기반 지식 마켓플레이스',
  description: '기존 전문가 시장(Gig Economy)의 한계를 넘어, 지식과 영향력을 가진 크리에이터(Creator)까지 "비즈니스 파트너"로 포용하는 진정한 지식 마켓플레이스. 파트너는 AI로 3분 만에 상품 등록, 클라이언트는 맞춤형 학습 경로를 제공받습니다.',
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
