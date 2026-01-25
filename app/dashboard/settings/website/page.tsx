'use client'

import { useState } from 'react'
import { 
  Globe, 
  User, 
  Palette, 
  Layout,
  Building2,
  Users as UsersIcon,
  Plus,
  X,
  Upload
} from 'lucide-react'
import FileUpload from '@/components/FileUpload'

type Tab = 'basic' | 'profile' | 'design' | 'sections'

export default function WebsiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [isTeam, setIsTeam] = useState(false)
  
  // 기본 정보
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    slug: '',
    description: '',
    logo: null as File | null,
    favicon: null as File | null,
  })
  
  // 프로필 정보
  const [profileInfo, setProfileInfo] = useState({
    displayName: '',
    tagline: '',
    bio: '',
    profileImage: null as File | null,
    email: '',
    phone: '',
    location: '',
    expertise: [] as string[],
  })
  
  // 팀원 정보
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: '', position: '', bio: '', photo: null as File | null }
  ])
  
  // 디자인
  const [design, setDesign] = useState({
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    accentColor: '#10B981',
  })
  
  // 섹션
  const [sections, setSections] = useState({
    hero: true,
    profile: true,
    team: false,
    products: true,
    blog: false,
    portfolio: false,
    contact: true,
  })

  const [newExpertise, setNewExpertise] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')
  const [profileImagePreview, setProfileImagePreview] = useState('')

  const tabs = [
    { id: 'basic' as Tab, name: '기본 정보', icon: Globe },
    { id: 'profile' as Tab, name: '프로필/팀', icon: User },
    { id: 'design' as Tab, name: '디자인', icon: Palette },
    { id: 'sections' as Tab, name: '섹션 관리', icon: Layout },
  ]

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { 
      id: Date.now().toString(), 
      name: '', 
      position: '', 
      bio: '', 
      photo: null 
    }])
  }

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id))
  }

  const addExpertise = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newExpertise.trim()) {
      e.preventDefault()
      if (!profileInfo.expertise.includes(newExpertise.trim())) {
        setProfileInfo(prev => ({
          ...prev,
          expertise: [...prev.expertise, newExpertise.trim()]
        }))
      }
      setNewExpertise('')
    }
  }

  const removeExpertise = (skill: string) => {
    setProfileInfo(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }))
  }

  const handleSave = () => {
    console.log('Saving all settings:', { basicInfo, profileInfo, teamMembers, design, sections, isTeam })
    alert('설정이 저장되었습니다!')
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">웹사이트 설정</h1>
        <p className="text-gray-400">웹사이트의 모든 설정을 한 곳에서 관리하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        {/* 기본 정보 탭 */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">기본 정보</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    웹사이트 제목
                  </label>
                  <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="예: 홍길동의 디자인 스튜디오"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL 슬러그
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">corefy.co/</span>
                    <input
                      type="text"
                      value={basicInfo.slug}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="your-name"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    웹사이트 설명
                  </label>
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="웹사이트에 대한 간단한 설명을 입력하세요"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FileUpload
                    label="로고"
                    description="클릭하여 로고 업로드"
                    accept="image/*"
                    maxSize={2}
                    value={logoPreview}
                    onChange={(file, preview) => {
                      setBasicInfo(prev => ({ ...prev, logo: file }))
                      if (preview) setLogoPreview(preview)
                    }}
                    preview={true}
                  />

                  <FileUpload
                    label="파비콘"
                    description="클릭하여 파비콘 업로드"
                    accept="image/*"
                    maxSize={1}
                    value={faviconPreview}
                    onChange={(file, preview) => {
                      setBasicInfo(prev => ({ ...prev, favicon: file }))
                      if (preview) setFaviconPreview(preview)
                    }}
                    preview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 프로필/팀 탭 */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* 개인/팀 토글 */}
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                {isTeam ? (
                  <Building2 className="w-5 h-5 text-primary-400" />
                ) : (
                  <User className="w-5 h-5 text-primary-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    {isTeam ? '팀으로 운영 중' : '개인으로 운영 중'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isTeam ? '팀원 정보를 표시합니다' : '개인 프로필을 표시합니다'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTeam}
                  onChange={(e) => setIsTeam(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* 개인 프로필 */}
            {!isTeam && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">개인 프로필</h2>

                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <FileUpload
                      label="프로필 이미지"
                      description="클릭하여 프로필 이미지 업로드"
                      accept="image/*"
                      maxSize={2}
                      value={profileImagePreview}
                      onChange={(file, preview) => {
                        setProfileInfo(prev => ({ ...prev, profileImage: file }))
                        if (preview) setProfileImagePreview(preview)
                      }}
                      preview={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">이름</label>
                    <input
                      type="text"
                      value={profileInfo.displayName}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">직함</label>
                    <input
                      type="text"
                      value={profileInfo.tagline}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="프리랜서 디자이너"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">자기소개</label>
                  <textarea
                    value={profileInfo.bio}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder="자기소개를 작성하세요"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">전문 분야</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileInfo.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeExpertise(skill)}
                          className="hover:text-primary-100"
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
                    onKeyDown={addExpertise}
                    placeholder="전문 분야를 입력하고 Enter"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 키를 눌러 추가</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                    <input
                      type="email"
                      value={profileInfo.email}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">전화번호</label>
                    <input
                      type="tel"
                      value={profileInfo.phone}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">지역</label>
                    <input
                      type="text"
                      value={profileInfo.location}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="서울, 대한민국"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 팀 정보 */}
            {isTeam && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">팀원 관리</h2>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    팀원 추가
                  </button>
                </div>

                {teamMembers.map((member, index) => (
                  <div key={member.id} className="p-6 bg-gray-800/30 rounded-xl border border-gray-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">팀원 {index + 1}</h3>
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">이름</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...teamMembers]
                            updated[index].name = e.target.value
                            setTeamMembers(updated)
                          }}
                          placeholder="홍길동"
                          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">직책</label>
                        <input
                          type="text"
                          value={member.position}
                          onChange={(e) => {
                            const updated = [...teamMembers]
                            updated[index].position = e.target.value
                            setTeamMembers(updated)
                          }}
                          placeholder="대표 / CTO / 디자이너"
                          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">소개</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => {
                          const updated = [...teamMembers]
                          updated[index].bio = e.target.value
                          setTeamMembers(updated)
                        }}
                        rows={2}
                        placeholder="간단한 소개"
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 디자인 탭 */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">디자인 설정</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={design.secondaryColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.secondaryColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.accentColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 섹션 관리 탭 */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">섹션 표시/숨김</h2>
            
            <div className="space-y-4">
              {Object.entries(sections).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-300 capitalize">
                      {key === 'hero' && 'Hero (메인 배너)'}
                      {key === 'profile' && 'Profile (프로필)'}
                      {key === 'team' && 'Team (팀 소개)'}
                      {key === 'products' && 'Products (상품)'}
                      {key === 'blog' && 'Blog (블로그)'}
                      {key === 'portfolio' && 'Portfolio (포트폴리오)'}
                      {key === 'contact' && 'Contact (연락처)'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {value ? '표시 중' : '숨김'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSections(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-4">
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
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all"
        >
          변경사항 저장
        </button>
      </div>
    </div>
  )
}
