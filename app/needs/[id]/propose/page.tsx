'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Loader2, Link as LinkIcon } from 'lucide-react'

export default function ProposeNeedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const supabase = createClient()

  const [needId, setNeedId] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proposedPrice, setProposedPrice] = useState<number>(0)
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([''])

  useEffect(() => {
    loadUser()
    params.then(p => setNeedId(p.id))
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

    if (profile?.role !== 'partner') {
      alert('파트너만 제안서를 제출할 수 있습니다.')
      router.back()
      return
    }

    setCurrentUser(profile)
  }

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

    setLoading(true)
    try {
      const validLinks = portfolioLinks.filter(link => link.trim())

      const { error } = await supabase
        .from('partner_proposals')
        .insert({
          need_id: needId,
          partner_id: currentUser.user_id,
          title,
          description,
          proposed_price: proposedPrice,
          estimated_duration: estimatedDuration || null,
          portfolio_links: validLinks.length > 0 ? validLinks : null
        })

      if (error) throw error

      alert('제안서가 제출되었습니다! 클라이언트가 검토 후 연락드릴 것입니다.')
      router.push(`/needs/${needId}`)
    } catch (error: any) {
      console.error('제안서 제출 오류:', error)
      if (error.code === '23505') {
        alert('이미 이 니즈에 제안서를 제출하셨습니다.')
      } else {
        alert('제출 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="glass border-b border-dark-800/50">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Intro */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">제안서 작성</h1>
          <p className="text-gray-400">
            클라이언트에게 어떻게 도움을 줄 수 있는지 구체적으로 설명해주세요
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제안 제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 전문적인 브랜드 디자인을 제공해드리겠습니다"
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              상세 설명 *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 프로젝트를 어떻게 진행할 것인지, 왜 본인이 적합한지 설명해주세요."
              className="w-full px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors min-h-[200px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: 구체적인 접근 방법, 과거 경험, 예상 결과물을 포함하면 좋습니다
            </p>
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                제안 금액 (원) *
              </label>
              <input
                type="number"
                value={proposedPrice || ''}
                onChange={(e) => setProposedPrice(parseInt(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                예상 기간 (선택)
              </label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="예: 2주, 1개월"
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Portfolio Links */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-300">
                포트폴리오 링크 (선택)
              </label>
              <button
                onClick={addPortfolioLink}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                + 링크 추가
              </button>
            </div>

            <div className="space-y-3">
              {portfolioLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updatePortfolioLink(index, e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  {portfolioLinks.length > 1 && (
                    <button
                      onClick={() => removePortfolioLink(index)}
                      className="px-4 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              노션, 비핸스, 깃허브 등 작업물을 확인할 수 있는 링크를 추가하세요
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim() || proposedPrice <= 0}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                제출 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                제안서 제출하기
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            제출 후 클라이언트가 검토하여 연락드립니다
          </p>
        </div>
      </div>
    </div>
  )
}
