import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const {
      displayName,
      title,
      tagline,
      bio,
      profileImage,
      email,
      phone,
      location,
      expertise = [],
    } = body

    // user_profiles 테이블에 upsert
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name: displayName,
        job_title: title,
        tagline,
        bio,
        profile_image_url: profileImage,
        email,
        phone,
        location,
        expertise,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
