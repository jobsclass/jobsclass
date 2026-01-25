'use client'

import { useState } from 'react'
import { X, Send, CheckCircle, Loader2 } from 'lucide-react'

interface ContactFormProps {
  username: string
  serviceId?: string
  serviceName?: string
  onClose: () => void
}

export default function ContactForm({ username, serviceId, serviceName, onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/public/${username}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceId: serviceId || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '문의 접수 실패')
      }

      setSuccess(true)
      
      // 3초 후 자동 닫기
      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (err: any) {
      console.error('Contact form error:', err)
      setError(err.message || '문의 접수 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">
            💬 문의하기
          </h2>
          {serviceName && (
            <p className="text-gray-400 text-sm">
              서비스: <span className="text-primary-400">{serviceName}</span>
            </p>
          )}
        </div>

        {/* 성공 메시지 */}
        {success ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-500/20 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              문의가 접수되었습니다!
            </h3>
            <p className="text-gray-400">
              빠른 시일 내에 답변드리겠습니다.
            </p>
          </div>
        ) : (
          <>
            {/* 폼 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 연락처 (선택) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  연락처 (선택)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* 문의 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  문의 내용 <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="문의하실 내용을 자유롭게 작성해주세요"
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    문의 보내기
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
