'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

interface QuotationRequestFormProps {
  productId: string
  productTitle: string
  partnerId: string
}

export default function QuotationRequestForm({ 
  productId, 
  productTitle,
  partnerId 
}: QuotationRequestFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    contactPreference: 'email' as 'email' | 'phone' | 'kakao'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectTitle || !formData.projectDescription) {
      alert('제목과 설명은 필수 항목입니다')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다')
        router.push('/auth/user/login')
        return
      }

      // quotation_requests 테이블에 저장
      const { data, error } = await supabase
        .from('quotation_requests')
        .insert({
          product_id: productId,
          client_id: user.id,
          project_title: formData.projectTitle,
          project_description: formData.projectDescription,
          budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : null,
          budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : null,
          deadline: formData.deadline || null,
          contact_preference: formData.contactPreference,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // 파트너에게 이메일 알림 (선택적 - API 라우트로 처리)
      try {
        await fetch('/api/notifications/quotation-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: data.id,
            partnerId,
            clientName: user.email
          })
        })
      } catch (emailError) {
        console.log('이메일 알림 실패 (무시)', emailError)
      }

      alert('견적 요청이 전송되었습니다! 파트너가 곧 연락드릴 예정입니다.')
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('견적 요청 오류:', error)
      alert(error.message || '견적 요청에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        뒤로 가기
      </button>

      <div className="card p-8">
        <h2 className="text-2xl font-bold text-white mb-2">견적 요청하기</h2>
        <p className="text-gray-400 mb-6">
          "{productTitle}"에 대한 맞춤 견적을 요청합니다
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로젝트 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              프로젝트 제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
              placeholder="예: 쇼핑몰 웹사이트 제작 요청"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              프로젝트 상세 설명 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              rows={8}
              placeholder="프로젝트 목표, 필요한 기능, 참고 자료, 원하는 스타일 등을 자세히 적어주세요"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              required
            />
          </div>

          {/* 예산 범위 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                예산 최소 (원)
              </label>
              <input
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                placeholder="3000000"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                예산 최대 (원)
              </label>
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                placeholder="5000000"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* 완료 희망일 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              완료 희망일
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* 연락 선호 방법 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              선호하는 연락 방법
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'email', label: '이메일', icon: '📧' },
                { value: 'phone', label: '전화', icon: '📞' },
                { value: 'kakao', label: '카카오톡', icon: '💬' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, contactPreference: option.value as any })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.contactPreference === option.value
                      ? 'bg-primary-500/20 border-primary-500 text-white'
                      : 'bg-dark-800 border-dark-700 text-gray-400 hover:border-primary-500/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>견적 요청 후 진행 방식</strong>
            </p>
            <ul className="mt-2 text-xs text-gray-400 space-y-1 ml-4">
              <li>• 파트너가 요청 내용을 검토합니다</li>
              <li>• 선호하신 방법으로 연락드립니다</li>
              <li>• 구체적인 견적과 일정을 협의합니다</li>
              <li>• 합의 후 계약을 진행합니다</li>
            </ul>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                견적 요청 보내기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
