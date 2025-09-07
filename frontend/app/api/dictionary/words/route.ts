import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get search query from URL params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query
    let query = supabase
      .from('dictionary')
      .select('id, word, language')
      .order('word', { ascending: true })
      .limit(limit)

    // Add search filter if provided
    if (search && search.length > 0) {
      query = query.ilike('word', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching dictionary words:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dictionary words' },
        { status: 500 }
      )
    }

    return NextResponse.json({ words: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
