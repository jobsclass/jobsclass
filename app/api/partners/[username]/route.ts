import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const supabase = await createClient()

    // Fetch partner profile
    const { data: partner, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .eq('user_type', 'partner')
      .single()

    if (error || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        display_name: partner.display_name,
        username: partner.username,
        avatar_url: partner.avatar_url,
        bio: partner.bio,
        tagline: partner.tagline,
        expertise: partner.expertise,
        social_links: partner.social_links,
        location: partner.location,
        website_url: partner.website_url,
        rating_average: partner.rating_average || 0,
        rating_count: partner.rating_count || 0,
        total_sales: partner.total_sales || 0,
      }
    })
  } catch (error: any) {
    console.error('Partner GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}
