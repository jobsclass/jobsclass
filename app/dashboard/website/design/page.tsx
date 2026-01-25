import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '디자인 설정 | Corefy',
}

export default function DesignPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">디자인 설정</h1>
        <p className="text-gray-400">웹사이트 색상, 폰트, 레이아웃을 설정하세요</p>
      </div>

      {/* 색상 설정 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">색상 설정</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {['Primary', 'Secondary', 'Accent', 'Text', 'Background'].map((color) => (
            <div key={color}>
              <label className="block text-sm font-medium text-gray-300 mb-2">{color}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue="#6366f1"
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue="#6366f1"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 폰트 설정 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-xl font-bold text-white mb-6">폰트 설정</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">제목 폰트</label>
            <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white">
              <option>Pretendard</option>
              <option>Noto Sans KR</option>
              <option>Inter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">본문 폰트</label>
            <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white">
              <option>Pretendard</option>
              <option>Noto Sans KR</option>
              <option>Inter</option>
            </select>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20">
          변경사항 저장
        </button>
      </div>
    </div>
  )
}
