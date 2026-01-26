'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowRight, Loader2, Calendar, DollarSign, MapPin } from 'lucide-react'

const categories = [
  { id: 'design', name: '디자인', icon: '🎨', examples: ['로고 디자인', 'UI/UX 디자인', '브랜드 디자인'] },
  { id: 'development', name: '개발', icon: '💻', examples: ['웹사이트 개발', '앱 개발', 'API 연동'] },
  { id: 'marketing', name: '마케팅', icon: '📈', examples: ['SNS 마케팅', 'SEO 컨설팅', '광고 대행'] },
  { id: 'writing', name: '콘텐츠', icon: '✍️', examples: ['블로그 작성', '영상 스크립트', '카피라이팅'] },
  { id: 'business', name: '비즈니스', icon: '💼', examples: ['사업계획서', '투자 IR', '경영 컨설팅'] },
  { id: 'education', name: '교육', icon: '📚', examples: ['1:1 강의', '멘토링', '스터디 그룹'] },
]

export default function CreateNeedPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState<number>(0)
  const [budgetMax, setBudgetMax] = useState<number>(0)
  const [deadline, setDeadline] = useState('')
  const [location, setLocation] = useState('')

  // AI 제안
  const [aiSuggestion, setAiSuggestion] = useState<string>('')

  useState(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/user/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setCurrentUser(profile)
  }

  // AI로 설명 개선
  const improveWithAI = async () => {
    if (!description.trim()) {
      alert('먼저 설명을 입력해주세요.')
      return
    }

    setAiGenerating(true)
    try {
      // TODO: AI API 호출
      // 임시로 간단한 개선 제안
      setAiSuggestion(`
📋 AI 개선 제안:

"${title || '프로젝트'}"를 진행하시는군요!

다음 정보를 추가하시면 파트너가 더 정확한 제안을 드릴 수 있습니다:

1. **목표**: 이 프로젝트의 최종 목표는 무엇인가요?
2. **타겟**: 누구를 위한 프로젝트인가요?
3. **기간**: 언제까지 완료하고 싶으신가요?
4. **참고자료**: 참고할 만한 사례가 있나요?
5. **특이사항**: 꼭 포함되어야 할 요소가 있나요?
      `.trim())
    } catch (error) {
      console.error('AI 생성 오류:', error)
      alert('AI 제안 생성에 실패했습니다.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCategory) {
      alert('카테고리를 선택해주세요.')
      return
    }
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!description.trim()) {
      alert('상세 설명을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      // 니즈 생성
      const { data: need, error } = await supabase
        .from('client_needs')
        .insert({
          client_id: currentUser.user_id,
          title,
          description,
          category: selectedCategory,
          budget_min: budgetMin || null,
          budget_max: budgetMax || null,
          deadline: deadline || null,
          location: location || null,
          expires_at: deadline ? new Date(deadline).toISOString() : null
        })
        .select()
        .single()

      if (error) throw error

      // TODO: AI 매칭 실행
      // 유사한 서비스 찾기

      alert('니즈가 등록되었습니다! 파트너들이 곧 제안을 보낼 것입니다.')
      router.push(`/needs/${need.id}`)
    } catch (error) {
      console.error('니즈 등록 오류:', error)
      alert('등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="glass border-b border-dark-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
              ← 뒤로
            </button>
            <h1 className="text-xl font-bold text-white">니즈 등록</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Intro */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">AI가 최적의 파트너를 매칭해드립니다</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            어떤 도움이 필요하신가요?
          </h2>
          <p className="text-gray-400">
            니즈를 등록하면 검증된 파트너들이 제안을 보냅니다
          </p>
        </div>

        {/* Step 1: 카테고리 선택 */}
        <div className="card p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">1. 카테고리 선택</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-800 hover:border-dark-700'
                }`}
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className="text-white font-semibold mb-2">{cat.name}</div>
                <div className="text-xs text-gray-500 space-y-1">
                  {cat.examples.map((ex, idx) => (
                    <div key={idx}>{ex}</div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: 제목 */}
        <div className="card p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">2. 제목</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 스타트업을 위한 브랜드 디자인이 필요합니다"
            className="w-full px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Step 3: 상세 설명 */}
        <div className="card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">3. 상세 설명</h3>
            <button
              onClick={improveWithAI}
              disabled={aiGenerating || !description.trim()}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI로 개선하기
                </>
              )}
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대해 자세히 설명해주세요. 목표, 타겟, 참고자료 등을 포함하면 더 정확한 제안을 받을 수 있습니다."
            className="w-full px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors min-h-[200px] resize-none mb-4"
          />

          {aiSuggestion && (
            <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <p className="text-sm text-primary-300 whitespace-pre-line">{aiSuggestion}</p>
            </div>
          )}
        </div>

        {/* Step 4: 예산 */}
        <div className="card p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">4. 예산 (선택)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">최소 예산</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  value={budgetMin || ''}
                  onChange={(e) => setBudgetMin(parseInt(e.target.value))}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">최대 예산</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  value={budgetMax || ''}
                  onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: 기타 정보 */}
        <div className="card p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">5. 추가 정보 (선택)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">마감일</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">지역 (오프라인 필요 시)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 서울 강남구"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedCategory || !title.trim() || !description.trim()}
          className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              니즈 등록하기
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          등록 후 24시간 내에 평균 5-10개의 제안을 받습니다
        </p>
      </div>
    </div>
  )
}
