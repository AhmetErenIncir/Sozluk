import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Create Supabase client
    const cookieStore = cookies()
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

export async function POST(request: Request) {
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

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      word,
      meaning,
      related_words = [],
      language = 'tr',
      part_of_speech,
      example_sentences = [],
      etymology,
      pronunciation
    } = body

    // Validation
    if (!word?.trim() || !meaning?.trim()) {
      return NextResponse.json(
        { error: 'Word and meaning are required' },
        { status: 400 }
      )
    }

    // Prepare data for insertion
    const dictionaryEntry = {
      word: word.trim(),
      meaning: meaning.trim(),
      created_by: user.id,
      created_by_username: user.email?.split('@')[0] || user.email || 'unknown',
      related_words: Array.isArray(related_words) ? related_words : [],
      language,
      part_of_speech: part_of_speech || null,
      example_sentences: Array.isArray(example_sentences) ? example_sentences : [],
      etymology: etymology || null,
      pronunciation: pronunciation || null
    }

    const { data, error: dbError } = await supabase
      .from('dictionary')
      .insert([dictionaryEntry])
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      if (dbError.code === '42501') {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      } else if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'Word already exists' },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: `Database error: ${dbError.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: data?.[0] || null 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
