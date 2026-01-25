'use client'

import { useState } from 'react'
import { Linkedin, Twitter, Github, Instagram, Globe, Youtube } from 'lucide-react'

export default function SocialLinksPage() {
  const [links, setLinks] = useState({
    linkedin: '',
    twitter: '',
    github: '',
    instagram: '',
    website: '',
    youtube: '',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">SNS 링크</h1>
        <p className="text-gray-400">소셜 미디어 링크를 추가하세요</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Linkedin className="w-5 h-5 text-blue-400" />
            LinkedIn
          </label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={links.linkedin}
            onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Twitter className="w-5 h-5 text-blue-400" />
            Twitter
          </label>
          <input
            type="url"
            placeholder="https://twitter.com/username"
            value={links.twitter}
            onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Github className="w-5 h-5 text-gray-400" />
            GitHub
          </label>
          <input
            type="url"
            placeholder="https://github.com/username"
            value={links.github}
            onChange={(e) => setLinks({ ...links, github: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            Instagram
          </label>
          <input
            type="url"
            placeholder="https://instagram.com/username"
            value={links.instagram}
            onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Youtube className="w-5 h-5 text-red-400" />
            YouTube
          </label>
          <input
            type="url"
            placeholder="https://youtube.com/@username"
            value={links.youtube}
            onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Globe className="w-5 h-5 text-primary-400" />
            개인 웹사이트
          </label>
          <input
            type="url"
            placeholder="https://yourwebsite.com"
            value={links.website}
            onChange={(e) => setLinks({ ...links, website: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
