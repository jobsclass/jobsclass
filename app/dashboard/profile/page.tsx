'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    displayName: '',
    jobTitle: '',
    tagline: '',
    bio: '',
    expertise: [] as string[],
    email: '',
    phone: '',
    location: '',
    profileImage: null as File | null
  })

  const [profileImagePreview, setProfileImagePreview] = useState<string>('')
  const [newExpertise, setNewExpertise] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/update')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      
      if (data.profile) {
        setFormData({
          displayName: data.profile.display_name || '',
          jobTitle: data.profile.job_title || '',
          tagline: data.profile.tagline || '',
          bio: data.profile.bio || '',
          expertise: data.profile.expertise || [],
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          location: data.profile.location || '',
          profileImage: null,
        })
        if (data.profile.avatar_url) {
          setProfileImagePreview(data.profile.avatar_url)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddExpertise = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newExpertise.trim()) {
      e.preventDefault()
      if (!formData.expertise.includes(newExpertise.trim())) {
        setFormData(prev => ({
          ...prev,
          expertise: [...prev.expertise, newExpertise.trim()]
        }))
      }
      setNewExpertise('')
    }
  }

  const handleRemoveExpertise = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '저장 실패')
      }

      alert('프로필이 성공적으로 저장되었습니다!')
      loadProfile()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || '프로필 저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

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
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-gray-700">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-600">👤</span>
              )}
            </div>
            <div className="flex-1">
              <FileUpload
                description="프로필 이미지 업로드"
                accept="image/*"
                maxSize={2}
                value={profileImagePreview}
                onChange={(file, preview) => {
                  handleInputChange('profileImage', file)
                  if (preview) setProfileImagePreview(preview)
                }}
                preview={false}
              />
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">표시 이름</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">직함</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="프리랜서 디자이너"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">한 줄 소개</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => handleInputChange('tagline', e.target.value)}
            placeholder="당신의 비즈니스를 성장시키는 디자인 파트너"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">자기소개</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={6}
            placeholder="자기소개를 작성하세요"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">전문 분야</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.expertise.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveExpertise(skill)}
                  className="hover:text-primary-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyDown={handleAddExpertise}
            placeholder="전문 분야를 입력하고 Enter"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">Enter 키를 눌러 추가</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">지역</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="서울, 대한민국"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
