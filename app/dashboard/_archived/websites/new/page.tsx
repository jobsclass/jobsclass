'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, ArrowRight } from 'lucide-react'

// 템플릿 타입 정의
interface Template {
  id: string
  name: string
  description: string
  category: string
  previewImage: string
  isPremium: boolean
  features: string[]
}

// 템플릿 데이터
const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern Business',
    description: '세련된 비즈니스 웹사이트',
    category: 'business',
    previewImage: '/templates/modern.png',
    isPremium: false,
    features: ['히어로 섹션', '소개', '서비스', '연락처']
  },
  {
    id: 'minimal',
    name: 'Minimal Portfolio',
    description: '미니멀한 포트폴리오',
    category: 'portfolio',
    previewImage: '/templates/minimal.png',
    isPremium: false,
    features: ['히어로', '포트폴리오', '소개', '연락처']
  },
  {
    id: 'creative',
    name: 'Creative Agency',
    description: '창의적인 에이전시',
    category: 'agency',
    previewImage: '/templates/creative.png',
    isPremium: false,
    features: ['히어로', '서비스', '팀', '연락처']
  }
]

export default function NewWebsitePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            ← 대시보드로 돌아가기
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">새 웹사이트 만들기</h1>
              <p className="text-gray-400 text-lg mt-2">
                템플릿을 선택하고 1분 만에 완성하세요
              </p>
            </div>
          </div>
        </div>

        {/* 진행 단계 */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator number={1} label="템플릿 선택" active />
            <div className="w-24 h-0.5 bg-gray-800"></div>
            <StepIndicator number={2} label="기본 정보" />
            <div className="w-24 h-0.5 bg-gray-800"></div>
            <StepIndicator number={3} label="콘텐츠 작성" />
            <div className="w-24 h-0.5 bg-gray-800"></div>
            <StepIndicator number={4} label="디자인 설정" />
            <div className="w-24 h-0.5 bg-gray-800"></div>
            <StepIndicator number={5} label="배포" />
          </div>
        </div>

        {/* 템플릿 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => setSelectedTemplate(template.id)}
            />
          ))}
        </div>

        {/* 다음 버튼 */}
        {selectedTemplate && (
          <div className="flex justify-center animate-fade-in">
            <Link
              href={`/dashboard/websites/new/setup?template=${selectedTemplate}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-2xl text-lg font-bold hover:shadow-lg hover:shadow-primary-500/20 hover:scale-105 transition-all"
            >
              다음 단계로
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ number, label, active = false }: { number: number; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
          active
            ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/20'
            : 'bg-gray-800 text-gray-500'
        }`}
      >
        {number}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: Template
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative text-left transition-all duration-300 ${
        isSelected ? 'scale-105' : 'hover:scale-102'
      }`}
    >
      {/* Gradient Border */}
      <div
        className={`absolute -inset-1 rounded-3xl blur transition-opacity duration-300 ${
          isSelected
            ? 'bg-gradient-to-r from-primary-500 to-purple-600 opacity-40'
            : 'bg-gradient-to-r from-primary-500 to-purple-600 opacity-0 group-hover:opacity-20'
        }`}
      ></div>

      <div
        className={`relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 border-2 transition-all ${
          isSelected ? 'border-primary-500' : 'border-gray-800 group-hover:border-gray-700'
        }`}
      >
        {/* 선택 체크 */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-fade-in">
            <Check className="w-6 h-6 text-white" />
          </div>
        )}

        {/* 프리미엄 배지 */}
        {template.isPremium && (
          <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
            PRO
          </div>
        )}

        {/* 미리보기 이미지 */}
        <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
          <span className="text-6xl">🎨</span>
        </div>

        {/* 정보 */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2">{template.name}</h3>
          <p className="text-gray-400">{template.description}</p>
        </div>

        {/* 카테고리 */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full text-sm font-semibold">
            {template.category}
          </span>
        </div>

        {/* 기능 목록 */}
        <ul className="space-y-2">
          {template.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
}
