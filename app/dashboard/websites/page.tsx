'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, Globe, Trash2, ExternalLink } from 'lucide-react'

interface Website {
  id: string
  title: string
  slug: string
  template_id: string
  is_published: boolean
  view_count: number
  created_at: string
}

export default function WebsitesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [websites, setWebsites] = useState<Website[]>([])
  const [username, setUsername] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/user/login')
        return
      }

      // 유저 프로필 가져오기
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username)
      }

      // 웹사이트 목록 가져오기
      const { data: websitesData } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setWebsites(websitesData || [])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('websites').delete().eq('id', id)

    if (!error) {
      setWebsites(websites.filter((w) => w.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">내 웹사이트</h1>
          <p className="text-gray-400 text-lg">
            {websites.length}개의 웹사이트를 관리하고 있습니다
          </p>
        </div>
        <Link
          href="/dashboard/websites/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/20 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          새 웹사이트 만들기
        </Link>
      </div>

      {/* 웹사이트 그리드 */}
      {websites.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-3xl mb-6">
            <Globe className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            아직 웹사이트가 없습니다
          </h3>
          <p className="text-gray-400 mb-8">
            첫 웹사이트를 만들고 1분 만에 배포하세요!
          </p>
          <Link
            href="/dashboard/websites/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-6 h-6" />
            첫 웹사이트 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              username={username}
              onDelete={() => handleDelete(website.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WebsiteCard({
  website,
  username,
  onDelete,
}: {
  website: Website
  username: string
  onDelete: () => void
}) {
  const publicUrl = `/${username}/${website.slug}`

  return (
    <div className="group relative">
      {/* Gradient Border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>

      <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
        {/* 상태 배지 */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              website.is_published
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}
          >
            {website.is_published ? '배포됨' : '비공개'}
          </span>
          <span className="text-sm text-gray-500">{website.template_id}</span>
        </div>

        {/* 썸네일 */}
        <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 flex items-center justify-center">
          <Globe className="w-12 h-12 text-gray-600" />
        </div>

        {/* 정보 */}
        <h3 className="text-xl font-bold text-white mb-2 truncate">
          {website.title}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          corefy.com{publicUrl}
        </p>

        {/* 통계 */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {website.view_count}
          </div>
          <div>
            {new Date(website.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          {website.is_published && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              보기
            </a>
          )}
          <Link
            href={`/dashboard/websites/${website.id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold"
          >
            <Edit className="w-4 h-4" />
            편집
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
