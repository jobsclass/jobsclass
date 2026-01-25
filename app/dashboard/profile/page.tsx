import { Metadata } from 'next'
import { Upload, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: '프로필 관리 | Corefy',
}

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">기본 정보</h1>
        <p className="text-gray-400">프로필 기본 정보를 입력하세요</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-8">
        {/* 프로필 이미지 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">프로필 이미지</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm transition-colors">
              이미지 업로드
            </button>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">표시 이름</label>
            <input
              type="text"
              placeholder="홍길동"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">직함</label>
            <input
              type="text"
              placeholder="프리랜서 디자이너"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">한 줄 소개</label>
          <input
            type="text"
            placeholder="당신의 비즈니스를 성장시키는 디자인 파트너"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">자기소개</label>
          <textarea
            rows={6}
            placeholder="자기소개를 작성하세요"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">전문 분야</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['UI/UX 디자인', 'Figma', 'Webflow'].map((skill) => (
              <span key={skill} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm">
                {skill}
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="전문 분야를 입력하고 Enter"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">전화번호</label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">지역</label>
            <input
              type="text"
              placeholder="서울, 대한민국"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20">
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  )
}
