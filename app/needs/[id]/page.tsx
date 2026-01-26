'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Clock, MapPin, DollarSign, User, Send, CheckCircle, XCircle } from 'lucide-react'

interface Need {
  id: string
  title: string
  description: string
  category: string
  budget_min: number
  budget_max: number
  deadline: string
  location: string
  status: string
  proposal_count: number
  created_at: string
  client_id: string
  user_profiles: {
    display_name: string
    client_bio: string
  }
}

interface Proposal {
  id: string
  title: string
  description: string
  proposed_price: number
  estimated_duration: string
  status: string
  created_at: string
  partner_id: string
  user_profiles: {
    display_name: string
    username: string
    partner_bio: string
    partner_success_rate: number
  }
}

export default function NeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const supabase = createClient()

  const [needId, setNeedId] = useState('')
  const [need, setNeed] = useState<Need | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
    params.then(p => {
      setNeedId(p.id)
      loadNeed(p.id)
      loadProposals(p.id)
    })
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setCurrentUser(profile)
    }
  }

  const loadNeed = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('client_needs')
        .select(`
          *,
          user_profiles!client_needs_client_id_fkey (
            display_name,
            client_bio
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setNeed(data)
    } catch (error) {
      console.error('니즈 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProposals = async (needId: string) => {
    try {
      const { data, error } = await supabase
        .from('partner_proposals')
        .select(`
          *,
          user_profiles!partner_proposals_partner_id_fkey (
            display_name,
            username,
            partner_bio,
            partner_success_rate
          )
        `)
        .eq('need_id', needId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])
    } catch (error) {
      console.error('제안서 로드 오류:', error)
    }
  }

  const handleAcceptProposal = async (proposalId: string) => {
    if (!confirm('이 제안을 수락하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('partner_proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId)

      if (error) throw error

      alert('제안이 수락되었습니다! 파트너와 대화를 시작하세요.')
      loadProposals(needId)
    } catch (error) {
      console.error('제안 수락 오류:', error)
      alert('수락 중 오류가 발생했습니다.')
    }
  }

  const handleRejectProposal = async (proposalId: string) => {
    if (!confirm('이 제안을 거절하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('partner_proposals')
        .update({ status: 'rejected' })
        .eq('id', proposalId)

      if (error) throw error

      alert('제안이 거절되었습니다.')
      loadProposals(needId)
    } catch (error) {
      console.error('제안 거절 오류:', error)
      alert('거절 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!need) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">니즈를 찾을 수 없습니다</p>
          <Link href="/marketplace" className="btn-primary">
            마켓플레이스로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = currentUser?.user_id === need.client_id
  const isPartner = currentUser?.role === 'partner'

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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Need Info */}
            <div className="card p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {need.category === 'design' ? '🎨' : 
                     need.category === 'development' ? '💻' :
                     need.category === 'marketing' ? '📈' :
                     need.category === 'writing' ? '✍️' :
                     need.category === 'business' ? '💼' :
                     need.category === 'education' ? '📚' : '🎯'}
                  </span>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{need.title}</h1>
                    <p className="text-sm text-gray-400">
                      {new Date(need.created_at).toLocaleDateString()} 등록
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  need.status === 'open' ? 'bg-green-500/20 text-green-300' :
                  need.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {need.status === 'open' ? '진행 중' :
                   need.status === 'in_progress' ? '협의 중' :
                   '완료'}
                </span>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300 whitespace-pre-wrap">{need.description}</p>
              </div>

              {/* Need Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-dark-900/50 rounded-xl">
                {need.budget_min > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-gray-500">예산</p>
                      <p className="text-white font-medium">
                        ₩{need.budget_min.toLocaleString()} ~ ₩{need.budget_max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {need.deadline && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-gray-500">마감일</p>
                      <p className="text-white font-medium">
                        {new Date(need.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {need.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-gray-500">지역</p>
                      <p className="text-white font-medium">{need.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-xs text-gray-500">받은 제안</p>
                    <p className="text-white font-medium">{need.proposal_count}개</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposals */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                받은 제안 ({proposals.length})
              </h2>

              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">아직 받은 제안이 없습니다</p>
                  {isPartner && (
                    <Link href={`/needs/${needId}/propose`} className="btn-primary inline-flex items-center gap-2">
                      제안서 제출하기
                      <Send className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map(proposal => (
                    <div key={proposal.id} className="p-6 bg-dark-900/50 rounded-xl border border-dark-800 hover:border-dark-700 transition-colors">
                      {/* Proposal Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {proposal.user_profiles.display_name[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {proposal.user_profiles.display_name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              @{proposal.user_profiles.username}
                            </p>
                            {proposal.user_profiles.partner_success_rate > 0 && (
                              <p className="text-xs text-green-400">
                                ✓ 성공률 {proposal.user_profiles.partner_success_rate}%
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          proposal.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                          proposal.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {proposal.status === 'accepted' ? '수락됨' :
                           proposal.status === 'rejected' ? '거절됨' :
                           '검토 중'}
                        </span>
                      </div>

                      {/* Proposal Content */}
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {proposal.title}
                      </h4>
                      <p className="text-gray-400 mb-4 whitespace-pre-wrap">
                        {proposal.description}
                      </p>

                      {/* Proposal Details */}
                      <div className="flex items-center gap-6 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">제안 금액:</span>
                          <span className="text-primary-400 font-bold ml-2">
                            ₩{proposal.proposed_price.toLocaleString()}
                          </span>
                        </div>
                        {proposal.estimated_duration && (
                          <div>
                            <span className="text-gray-500">예상 기간:</span>
                            <span className="text-white font-medium ml-2">
                              {proposal.estimated_duration}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions (클라이언트만) */}
                      {isOwner && proposal.status === 'pending' && (
                        <div className="flex gap-2 pt-4 border-t border-dark-800">
                          <button
                            onClick={() => handleAcceptProposal(proposal.id)}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            수락
                          </button>
                          <button
                            onClick={() => handleRejectProposal(proposal.id)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Client Info */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">클라이언트</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {need.user_profiles.display_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {need.user_profiles.display_name}
                    </p>
                  </div>
                </div>
                {need.user_profiles.client_bio && (
                  <p className="text-sm text-gray-400">
                    {need.user_profiles.client_bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              {isPartner && (
                <Link
                  href={`/needs/${needId}/propose`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  제안서 제출하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
