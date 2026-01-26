'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Loader2, Link as LinkIcon, Sparkles, AlertCircle } from 'lucide-react'

export default function ProposeNeedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const supabase = createClient()

  const [needId, setNeedId] = useState('')
  const [need, setNeed] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proposedPrice, setProposedPrice] = useState<number>(0)
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([''])

  useEffect(() => {
    params.then(p => {
      setNeedId(p.id)
      loadNeed(p.id)
    })
    loadUser()
  }, [])

  const loadNeed = async (id: string) => {
    const { data } = await supabase
      .from('client_needs')
      .select('*')
      .eq('id', id)
      .single()
    
    setNeed(data)
  }

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

    if (profile?.profile_type !== 'partner') {
      alert('파트너만 제안서를 제출할 수 있습니다.')
      router.back()
      return
    }

    setCurrentUser(profile)
  }

  // 크레딧 차감 계산 (금액 규모에 따라)
  const calculateCreditCost = (amount: number): number => {
    if (amount < 500000) return 5        // 50만원 미만: 5 크레딧
    if (amount < 1000000) return 10      // 100만원 미만: 10 크레딧
    if (amount < 3000000) return 15      // 300만원 미만: 15 크레딧
    if (amount < 5000000) return 20      // 500만원 미만: 20 크레딧
    return 30                            // 500만원 이상: 30 크레딧
  }

  const creditCost = calculateCreditCost(proposedPrice)

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, ''])
  }

  const updatePortfolioLink = (index: number, value: string) => {
    const newLinks = [...portfolioLinks]
    newLinks[index] = value
    setPortfolioLinks(newLinks)
  }

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!description.trim()) {
      alert('상세 설명을 입력해주세요.')
      return
    }
    if (proposedPrice <= 0) {
      alert('제안 금액을 입력해주세요.')
      return
    }

    // 크레딧 확인
    if (!currentUser || currentUser.ai_credits < creditCost) {
      alert(`제안서 제출에 ${creditCost} 크레딧이 필요합니다. 현재 잔액: ${currentUser?.ai_credits || 0} 크레딧`)
      return
    }

    setLoading(true)
    try {
      const validLinks = portfolioLinks.filter(link => link.trim())

      // 1. 제안서 제출
      const { error: proposalError } = await supabase
        .from('partner_proposals')
        .insert({
          need_id: needId,
          partner_id: currentUser.user_id,
          title,
          description,
          proposed_amount: proposedPrice,
          estimated_duration: estimatedDuration || null,
          portfolio_links: validLinks.length > 0 ? validLinks : null
        })

      if (proposalError) throw proposalError

      // 2. 크레딧 차감
      const { error: creditError } = await supabase
        .from('user_profiles')
        .update({
          ai_credits: currentUser.ai_credits - creditCost
        })
        .eq('user_id', currentUser.user_id)

      if (creditError) throw creditError

      // 3. 크레딧 거래 기록
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: currentUser.user_id,
          type: 'usage',
          amount: -creditCost,
          balance_after: currentUser.ai_credits - creditCost,
          description: `제안서 제출: ${title}`,
          metadata: {
            need_id: needId,
            proposed_amount: proposedPrice
          }
        })

      alert(`제안서가 제출되었습니다! (${creditCost} 크레딧 차감)\n클라이언트가 검토 후 연락드립니다.`)
      router.push(`/needs/${needId}`)
    } catch (error: any) {
      console.error('제안서 제출 오류:', error)
      alert(error.message || '제안서 제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || !need) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* 헤더 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          뒤로 가기
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">제안서 작성</h1>
          <p className="text-gray-400">니즈: {need.title}</p>
        </div>

        {/* 크레딧 안내 */}
        <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">AI 크레딧 차감</span>
                <span className="text-lg font-bold text-primary-400">{creditCost} 크레딧</span>
              </div>
              <p className="text-xs text-gray-400">
                현재 잔액: <strong>{currentUser.ai_credits} 크레딧</strong>
                {currentUser.ai_credits < creditCost && (
                  <span className="text-red-400 ml-2">⚠️ 크레딧이 부족합니다</span>
                )}
              </p>
              <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-500">
                💡 제안 금액별 크레딧: 50만원 미만(5), 100만원 미만(10), 300만원 미만(15), 500만원 미만(20), 500만원 이상(30)
              </div>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제안서 제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 경력 10년 개발자의 맞춤형 웹사이트 제작"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* 제안 금액 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제안 금액 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={proposedPrice || ''}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                placeholder="1000000"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">원</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              클라이언트 예산: ₩{need.budget_min.toLocaleString()} ~ ₩{need.budget_max.toLocaleString()}
            </p>
          </div>

          {/* 예상 기간 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              예상 작업 기간
            </label>
            <input
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="예: 2주, 1개월"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제안 내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="어떻게 작업할 것인지, 왜 당신이 적합한지 구체적으로 설명해주세요."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {/* 포트폴리오 링크 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              포트폴리오 링크
            </label>
            {portfolioLinks.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updatePortfolioLink(index, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
                {portfolioLinks.length > 1 && (
                  <button
                    onClick={() => removePortfolioLink(index)}
                    className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addPortfolioLink}
              className="flex items-center gap-2 px-4 py-2 text-sm text-primary-400 hover:text-primary-300"
            >
              <LinkIcon className="w-4 h-4" />
              링크 추가
            </button>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !currentUser || currentUser.ai_credits < creditCost}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  제출 중...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  제안서 제출 ({creditCost} 크레딧)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
