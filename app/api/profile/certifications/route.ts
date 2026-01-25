import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data, error } = await supabase
      .from('user_certifications')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_date', { ascending: false })

    if (error) return NextResponse.json({ error: '자격증 목록을 불러오는데 실패했습니다' }, { status: 500 })
    return NextResponse.json({ certifications: data || [] })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { name, issuer, issuedDate, expiryDate, credentialId, credentialUrl } = await request.json()

    const { data, error } = await supabase
      .from('user_certifications')
      .insert({ user_id: user.id, name, issuer, issued_date: issuedDate, expiry_date: expiryDate, credential_id: credentialId, credential_url: credentialUrl })
      .select()
      .single()

    if (error) return NextResponse.json({ error: '자격증 추가에 실패했습니다' }, { status: 500 })
    return NextResponse.json({ certification: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { id, name, issuer, issuedDate, expiryDate, credentialId, credentialUrl } = await request.json()
    if (!id) return NextResponse.json({ error: '자격증 ID가 필요합니다' }, { status: 400 })

    const { data, error } = await supabase
      .from('user_certifications')
      .update({ name, issuer, issued_date: issuedDate, expiry_date: expiryDate, credential_id: credentialId, credential_url: credentialUrl })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: '자격증 수정에 실패했습니다' }, { status: 500 })
    return NextResponse.json({ certification: data })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: '자격증 ID가 필요합니다' }, { status: 400 })

    const { error } = await supabase.from('user_certifications').delete().eq('id', id).eq('user_id', user.id)
    if (error) return NextResponse.json({ error: '자격증 삭제에 실패했습니다' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
