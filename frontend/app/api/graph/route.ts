// API route for graph data fetching
// Supports both mock data and Supabase backend

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { normalizeWord, sanitizeInput } from '@/lib/text-utils';
import { GraphPayload, ApiGraphResponse } from '@/lib/graph-types';

// Request validation schema
const GraphRequestSchema = z.object({
  word: z.string().min(1).max(100),
});

// Response validation schema
const GraphDataSchema = z.object({
  word: z.string(),
  related_words: z.array(z.string()).optional().default([]),
});

/**
 * Mock data for development (same as MockDataSource but server-side)
 */
const MOCK_DATA: Record<string, string[]> = {
  kitap: ['roman', 'öykü', 'şiir', 'yazı', 'yazar', 'okuma', 'kütüphane', 'sayfa', 'kağıt', 'basım', 'edebiyat', 'hikaye'],
  roman: ['kitap', 'yazar', 'karakter', 'hikaye', 'edebiyat', 'okuma', 'kurgu', 'anlatı', 'sayfa', 'bölüm', 'kahraman'],
  yazar: ['kitap', 'roman', 'yazmak', 'kalem', 'hikaye', 'şiir', 'edebiyat', 'metin', 'kelime', 'cümle', 'düşünce'],
  yazmak: ['yazar', 'kalem', 'kağıt', 'kelime', 'cümle', 'metin', 'yazı', 'harf', 'düşünce', 'ifade', 'anlatım'],
  kelime: ['harf', 'ses', 'anlam', 'cümle', 'dil', 'sözcük', 'kavram', 'ifade', 'yazı', 'konuşma', 'düşünce'],
  okuma: ['kitap', 'göz', 'anlama', 'öğrenme', 'bilgi', 'ders', 'eğitim', 'kültür', 'gelişim', 'zeka', 'dikkat'],
  ağaç: ['yaprak', 'dal', 'kök', 'gövde', 'orman', 'doğa', 'yeşil', 'büyüme', 'mevsim', 'meyve', 'çiçek'],
  sevgi: ['aşk', 'kalp', 'mutluluk', 'aile', 'anne', 'dostluk', 'şefkat', 'bağlılık', 'güven', 'paylaşım'],
  güneş: ['ışık', 'sıcaklık', 'sarı', 'parlak', 'enerji', 'gün', 'yaz', 'doğa', 'yaşam', 'güç'],
  sözlük: ['kelime', 'anlam', 'dil', 'kitap', 'öğrenme', 'bilgi', 'çeviri', 'açıklama'],
};

/**
 * Fetch from mock data source
 */
async function fetchFromMock(word: string): Promise<GraphPayload> {
  const normalizedWord = normalizeWord(word);
  const related = MOCK_DATA[normalizedWord] || [];

  // Apply max related per node limit (default 20)
  const maxRelated = parseInt(process.env.MAX_RELATED_PER_NODE || '20');
  const limitedRelated = related.slice(0, maxRelated);

  return {
    word: normalizedWord,
    related: limitedRelated,
  };
}

/**
 * Fetch from Supabase database
 */
async function fetchFromSupabase(word: string): Promise<GraphPayload> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server-only key

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const normalizedWord = normalizeWord(word);

  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('word, related_words')
      .eq('word', normalizedWord)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      // Word not found, return empty result
      return { word: normalizedWord, related: [] };
    }

    // Validate and process the response
    const validated = GraphDataSchema.parse(data);
    const related = Array.isArray(validated.related_words) ? validated.related_words : [];

    // Apply max related per node limit
    const maxRelated = parseInt(process.env.MAX_RELATED_PER_NODE || '20');
    const limitedRelated = related.slice(0, maxRelated);

    return {
      word: validated.word,
      related: limitedRelated,
    };
  } catch (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }
}

/**
 * GET /api/graph?word=...
 * Fetches related words for the given word
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawWord = searchParams.get('word');

    if (!rawWord) {
      return NextResponse.json<ApiGraphResponse>(
        { success: false, error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Validate and sanitize input
    const validation = GraphRequestSchema.safeParse({ word: rawWord });
    if (!validation.success) {
      return NextResponse.json<ApiGraphResponse>(
        { success: false, error: 'Invalid word parameter' },
        { status: 400 }
      );
    }

    const sanitizedWord = sanitizeInput(validation.data.word);
    if (!sanitizedWord) {
      return NextResponse.json<ApiGraphResponse>(
        { success: false, error: 'Invalid word format' },
        { status: 400 }
      );
    }

    // Determine data source
    const dataSource = process.env.DATA_SOURCE || 'mock';
    let result: GraphPayload;

    switch (dataSource.toLowerCase()) {
      case 'supabase':
        result = await fetchFromSupabase(sanitizedWord);
        break;
      case 'mock':
      default:
        result = await fetchFromMock(sanitizedWord);
        break;
    }

    return NextResponse.json<ApiGraphResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Graph API error:', error);

    return NextResponse.json<ApiGraphResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}