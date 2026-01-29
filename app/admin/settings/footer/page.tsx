'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, RefreshCw } from 'lucide-react'

interface Setting {
  key: string
  value: any
  description: string
}

export default function AdminFooterSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Setting[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({
    footer_company_name: '',
    footer_business_number: '',
    footer_online_marketing_number: '',
    footer_address: '',
    footer_email: '',
    footer_phone: '',
    footer_business_hours: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/site-settings?category=footer')
      const data = await response.json()

      if (data.success) {
        setSettings(data.settings)
        
        // 폼 데이터 초기화
        const newFormData: Record<string, string> = {}
        data.settings.forEach((setting: any) => {
          // JSONB 값 파싱
          const value = setting.value?.value || setting.value?.ko || ''
          newFormData[setting.key] = value
        })
        setFormData(newFormData)
      }
    } catch (error) {
      console.error('설정 로드 오류:', error)
      alert('설정을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // 모든 설정 업데이트
      const updates = Object.entries(formData).map(([key, value]) => {
        return fetch('/api/admin/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            value: { value }, // JSONB 형식
            category: 'footer',
            description: getDescription(key)
          })
        })
      })

      await Promise.all(updates)

      alert('푸터 설정이 저장되었습니다!')
    } catch (error) {
      console.error('설정 저장 오류:', error)
      alert('설정 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const getDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      footer_company_name: '회사명',
      footer_business_number: '사업자등록번호',
      footer_online_marketing_number: '통신판매업신고번호',
      footer_address: '사업장 주소',
      footer_email: '대표 이메일',
      footer_phone: '대표 전화번호',
      footer_business_hours: '운영시간'
    }
    return descriptions[key] || key
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">푸터 정보 관리</h1>
          <p className="text-gray-600">사이트 푸터에 표시될 회사 정보를 관리합니다.</p>
        </div>

        {/* 설정 폼 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* 회사명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회사명
              </label>
              <input
                type="text"
                value={formData.footer_company_name}
                onChange={(e) => handleChange('footer_company_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 잡스클래스"
              />
            </div>

            {/* 사업자등록번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업자등록번호
              </label>
              <input
                type="text"
                value={formData.footer_business_number}
                onChange={(e) => handleChange('footer_business_number', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 123-45-67890"
              />
            </div>

            {/* 통신판매업신고번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                통신판매업신고번호
              </label>
              <input
                type="text"
                value={formData.footer_online_marketing_number}
                onChange={(e) => handleChange('footer_online_marketing_number', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 제2024-서울강남-01234호"
              />
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업장 주소
              </label>
              <input
                type="text"
                value={formData.footer_address}
                onChange={(e) => handleChange('footer_address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 서울특별시 강남구 테헤란로 123"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표 이메일
              </label>
              <input
                type="email"
                value={formData.footer_email}
                onChange={(e) => handleChange('footer_email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: support@jobsclass.com"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표 전화번호
              </label>
              <input
                type="tel"
                value={formData.footer_phone}
                onChange={(e) => handleChange('footer_phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 02-1234-5678"
              />
            </div>

            {/* 운영시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                운영시간
              </label>
              <input
                type="text"
                value={formData.footer_business_hours}
                onChange={(e) => handleChange('footer_business_hours', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="예: 평일 10:00-18:00 (주말, 공휴일 휴무)"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={loadSettings}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 미리보기 */}
        <div className="mt-8 bg-gray-900 text-white rounded-lg p-8">
          <h2 className="text-xl font-bold mb-6">푸터 미리보기</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p className="text-white font-medium text-lg">{formData.footer_company_name || '회사명'}</p>
            <p>사업자등록번호: {formData.footer_business_number || '미입력'}</p>
            <p>통신판매업신고: {formData.footer_online_marketing_number || '미입력'}</p>
            <p>주소: {formData.footer_address || '미입력'}</p>
            <p>이메일: {formData.footer_email || '미입력'}</p>
            <p>전화: {formData.footer_phone || '미입력'}</p>
            <p>운영시간: {formData.footer_business_hours || '미입력'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
