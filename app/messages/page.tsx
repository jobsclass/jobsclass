'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Send, Search, AlertCircle, Loader2 } from 'lucide-react'

interface Conversation {
  id: string
  partner_id: string
  client_id: string
  service_id: string | null
  last_message_at: string
  partner_unread_count: number
  client_unread_count: number
  status: string
  partner?: {
    display_name: string
    username: string
    profile_url: string
  }
  client?: {
    display_name: string
    username: string
  }
  service?: {
    title: string
  }
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  content_filtered: string | null
  has_contact_info: boolean
  read_at: string | null
  created_at: string
  sender?: {
    display_name: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadConversations()
    }
  }, [currentUser])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
      markAsRead(selectedConversation)
    }
  }, [selectedConversation])

  const loadUser = async () => {
    try {
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

      setCurrentUser({ ...user, ...profile })
    } catch (error) {
      console.error('사용자 로드 오류:', error)
    }
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          partner:user_profiles!conversations_partner_id_fkey(display_name, username, profile_url),
          client:user_profiles!conversations_client_id_fkey(display_name, username),
          service:services(title)
        `)
        .or(`partner_id.eq.${currentUser.user_id},client_id.eq.${currentUser.user_id}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('대화 목록 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(display_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('메시지 로드 오류:', error)
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) return

      const isPartner = conversation.partner_id === currentUser.user_id

      // 읽지 않은 메시지를 읽음 처리
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', currentUser.user_id)
        .is('read_at', null)

      if (error) throw error

      // 대화의 unread_count 초기화
      await supabase
        .from('conversations')
        .update({
          [isPartner ? 'partner_unread_count' : 'client_unread_count']: 0
        })
        .eq('id', conversationId)

      // 대화 목록 새로고침
      loadConversations()
    } catch (error) {
      console.error('읽음 처리 오류:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const conversation = conversations.find(c => c.id === selectedConversation)
      if (!conversation) return

      const receiverId = conversation.partner_id === currentUser.user_id 
        ? conversation.client_id 
        : conversation.partner_id

      // 연락처 감지
      const contactDetection = detectContactInfo(newMessage)

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: currentUser.user_id,
          receiver_id: receiverId,
          content: newMessage,
          content_filtered: contactDetection.filtered,
          has_contact_info: contactDetection.hasContact,
          detected_contacts: contactDetection.contacts
        })
        .select()
        .single()

      if (error) throw error

      // 연락처 감지 로그
      if (contactDetection.hasContact) {
        for (const contact of contactDetection.contacts) {
          await supabase.from('contact_detection_logs').insert({
            message_id: data.id,
            user_id: currentUser.user_id,
            detected_type: contact.type,
            detected_value: contact.value,
            action_taken: 'warn'
          })
        }
      }

      setNewMessage('')
      loadMessages(selectedConversation)
      loadConversations()
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  // 연락처 정보 감지
  const detectContactInfo = (text: string) => {
    const contacts: Array<{ type: string; value: string }> = []
    let filtered = text

    // 전화번호 패턴
    const phoneRegex = /01[0-9]-?[0-9]{3,4}-?[0-9]{4}/g
    const phones = text.match(phoneRegex)
    if (phones) {
      phones.forEach(phone => {
        contacts.push({ type: 'phone', value: phone })
        filtered = filtered.replace(phone, '[연락처]')
      })
    }

    // 이메일 패턴
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = text.match(emailRegex)
    if (emails) {
      emails.forEach(email => {
        contacts.push({ type: 'email', value: email })
        filtered = filtered.replace(email, '[이메일]')
      })
    }

    // 카카오톡 ID 패턴
    const kakaoRegex = /카카오톡?\s*:?\s*([a-zA-Z0-9_-]+)/gi
    const kakaos = text.match(kakaoRegex)
    if (kakaos) {
      kakaos.forEach(kakao => {
        contacts.push({ type: 'kakao', value: kakao })
        filtered = filtered.replace(kakao, '[카카오톡 ID]')
      })
    }

    // URL 패턴
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = text.match(urlRegex)
    if (urls) {
      urls.forEach(url => {
        // jobsclass.vercel.app는 허용
        if (!url.includes('jobsclass')) {
          contacts.push({ type: 'url', value: url })
          filtered = filtered.replace(url, '[링크]')
        }
      })
    }

    return {
      hasContact: contacts.length > 0,
      contacts,
      filtered
    }
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const otherUser = conv.partner_id === currentUser?.user_id ? conv.client : conv.partner
    return otherUser?.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* 대화 목록 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">메시지</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="대화 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* 대화 목록 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p>대화가 없습니다</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isPartner = conv.partner_id === currentUser?.user_id
                const otherUser = isPartner ? conv.client : conv.partner
                const unreadCount = isPartner ? conv.partner_unread_count : conv.client_unread_count

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {otherUser?.display_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.display_name}
                          </h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.service && (
                          <p className="text-xs text-gray-500 truncate">
                            {conv.service.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(conv.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation && selectedConv ? (
            <>
              {/* 헤더 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {(selectedConv.partner_id === currentUser?.user_id 
                      ? selectedConv.client?.display_name[0] 
                      : selectedConv.partner?.display_name[0])}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConv.partner_id === currentUser?.user_id 
                        ? selectedConv.client?.display_name 
                        : selectedConv.partner?.display_name}
                    </h2>
                    {selectedConv.service && (
                      <p className="text-sm text-gray-500">{selectedConv.service.title}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isMine = msg.sender_id === currentUser?.user_id
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                          isMine 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">
                            {msg.has_contact_info ? msg.content_filtered : msg.content}
                          </p>
                        </div>
                        {msg.has_contact_info && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-orange-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>연락처가 포함된 메시지입니다</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 입력 영역 */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        전송
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ 플랫폼 외부에서 거래하지 마세요. 연락처 공유 시 경고가 표시됩니다.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                <p>대화를 선택해주세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
