import { Metadata } from 'next'
import { GripVertical, Eye, EyeOff } from 'lucide-react'

export const metadata: Metadata = {
  title: '섹션 관리 | Jobs Build',
  description: '웹사이트 섹션 표시/숨김 및 순서 조정',
}

const sections = [
  { id: 'hero', name: 'Hero 섹션', description: '메인 배너 영역', enabled: true },
  { id: 'profile', name: '프로필', description: '자기소개 및 경력', enabled: true },
  { id: 'products', name: '상품 목록', description: '판매 상품 표시', enabled: true },
  { id: 'blog', name: '블로그', description: '최근 블로그 글', enabled: false },
  { id: 'portfolio', name: '포트폴리오', description: '프로젝트 사례', enabled: false },
  { id: 'contact', name: '연락처', description: '문의 폼 및 연락 정보', enabled: true },
]

export default function SectionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">섹션 관리</h1>
        <p className="text-gray-400">웹사이트에 표시할 섹션을 선택하고 순서를 조정하세요</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center gap-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
            >
              <GripVertical className="w-5 h-5 text-gray-600 cursor-move" />
              
              <div className="flex-1">
                <h3 className="text-white font-medium">{section.name}</h3>
                <p className="text-sm text-gray-400">{section.description}</p>
              </div>

              <button
                className={`p-2 rounded-lg transition-colors ${
                  section.enabled
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {section.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all">
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  )
}
