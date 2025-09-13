// DataSource abstraction for graph data fetching
import { GraphPayload } from './graph-types';
import { normalizeWord } from './text-utils';

export interface DataSource {
  fetchWord(word: string): Promise<GraphPayload>;
}

/**
 * Mock DataSource for development and testing
 * Contains Turkish dictionary words with semantic relationships
 */
export class MockDataSource implements DataSource {
  private static readonly mockData: Record<string, string[]> = {
    // Books and literature
    kitap: ['roman', 'öykü', 'şiir', 'yazı', 'yazar', 'okuma', 'kütüphane', 'sayfa', 'kağıt', 'basım', 'edebiyat', 'hikaye', 'ders', 'bilgi', 'öğrenim'],
    roman: ['kitap', 'yazar', 'karakter', 'hikaye', 'edebiyat', 'okuma', 'kurgu', 'anlatı', 'sayfa', 'bölüm', 'kahraman', 'olay', 'tema', 'stil'],
    yazar: ['kitap', 'roman', 'yazmak', 'kalem', 'hikaye', 'şiir', 'edebiyat', 'metin', 'kelime', 'cümle', 'düşünce', 'sanat', 'yaratıcılık'],

    // Writing and language
    yazmak: ['yazar', 'kalem', 'kağıt', 'kelime', 'cümle', 'metin', 'yazı', 'harf', 'düşünce', 'ifade', 'anlatım', 'dil'],
    kelime: ['harf', 'ses', 'anlam', 'cümle', 'dil', 'sözcük', 'kavram', 'ifade', 'yazı', 'konuşma', 'düşünce', 'iletişim'],
    cümle: ['kelime', 'nokta', 'virgül', 'anlam', 'düşünce', 'yazı', 'gramer', 'sözdizimi', 'ifade', 'metin'],

    // Reading and learning
    okuma: ['kitap', 'göz', 'anlama', 'öğrenme', 'bilgi', 'ders', 'eğitim', 'kültür', 'gelişim', 'zeka', 'dikkat', 'kavrama'],
    öğrenme: ['ders', 'okul', 'öğretmen', 'bilgi', 'zeka', 'hafıza', 'anlama', 'gelişim', 'eğitim', 'çalışma', 'pratik'],
    ders: ['öğretmen', 'öğrenci', 'okul', 'bilgi', 'öğrenme', 'eğitim', 'sınıf', 'konu', 'anlama', 'çalışma'],

    // Education
    okul: ['öğrenci', 'öğretmen', 'ders', 'sınıf', 'eğitim', 'öğrenme', 'bilgi', 'gelişim', 'arkadaş', 'kitap', 'not'],
    öğretmen: ['ders', 'öğrenci', 'okul', 'eğitim', 'bilgi', 'öğrenme', 'sınıf', 'anlatım', 'rehberlik', 'gelişim'],
    öğrenci: ['okul', 'ders', 'öğretmen', 'öğrenme', 'kitap', 'sınıf', 'arkadaş', 'not', 'sınav', 'gelişim'],

    // Nature
    ağaç: ['yaprak', 'dal', 'kök', 'gövde', 'orman', 'doğa', 'yeşil', 'büyüme', 'mevsim', 'meyve', 'çiçek', 'gölge'],
    yaprak: ['ağaç', 'yeşil', 'dal', 'sonbahar', 'sarı', 'düşmek', 'doğa', 'fotosentez', 'güneş', 'rüzgar'],
    orman: ['ağaç', 'yeşil', 'doğa', 'hayvan', 'kuş', 'hava', 'oksijen', 'sessizlik', 'gölge', 'yürüyüş'],

    // Colors
    yeşil: ['yaprak', 'ağaç', 'çim', 'doğa', 'renk', 'mavi', 'sarı', 'güzel', 'taze', 'umut', 'büyüme'],
    mavi: ['gökyüzü', 'deniz', 'renk', 'yeşil', 'kırmızı', 'sakinlik', 'serinlik', 'güzel', 'derinlik'],
    kırmızı: ['kan', 'aşk', 'ateş', 'renk', 'mavi', 'sarı', 'güçlü', 'sıcaklık', 'dikkat', 'tehlike'],

    // Family
    aile: ['anne', 'baba', 'çocuk', 'kardeş', 'ev', 'sevgi', 'birliktelik', 'mutluluk', 'güven', 'destek'],
    anne: ['baba', 'çocuk', 'aile', 'sevgi', 'şefkat', 'bakım', 'koruma', 'ev', 'yemek', 'öpücük'],
    baba: ['anne', 'çocuk', 'aile', 'güç', 'koruma', 'çalışma', 'para', 'destek', 'oyun', 'sevgi'],
    çocuk: ['anne', 'baba', 'oyun', 'okul', 'büyüme', 'masum', 'neşe', 'öğrenme', 'gelecek', 'hayat'],

    // Emotions
    sevgi: ['aşk', 'kalp', 'mutluluk', 'aile', 'anne', 'dostluk', 'şefkat', 'bağlılık', 'güven', 'paylaşım'],
    mutluluk: ['gülümseme', 'neşe', 'sevinç', 'sevgi', 'keyif', 'huzur', 'yaşam', 'pozitif', 'enerji'],
    üzüntü: ['gözyaşı', 'hüzün', 'acı', 'kayıp', 'yalnızlık', 'kalp', 'anı', 'özlem', 'sessizlik'],

    // Time
    zaman: ['saat', 'dakika', 'saniye', 'gün', 'ay', 'yıl', 'geçmek', 'beklemek', 'hızlı', 'yavaş', 'an'],
    gün: ['güneş', 'sabah', 'öğle', 'akşam', 'gece', 'ışık', 'çalışma', 'yaşam', 'rutim', 'aktivite'],
    gece: ['karanlık', 'ay', 'yıldız', 'uyku', 'rüya', 'sessizlik', 'dinlenmek', 'huzur', 'soğuk'],

    // Weather and seasons
    güneş: ['ışık', 'sıcaklık', 'sarı', 'parlak', 'enerji', 'gün', 'yaz', 'doğa', 'yaşam', 'güç'],
    yağmur: ['su', 'bulut', 'gökyüzü', 'serinlik', 'temizlik', 'büyüme', 'şemsiye', 'ses', 'koku'],
    kar: ['beyaz', 'soğuk', 'kış', 'temiz', 'sessizlik', 'güzel', 'yumuşak', 'çocuk', 'oyun'],

    // Default fallbacks
    sözlük: ['kelime', 'anlam', 'dil', 'kitap', 'öğrenme', 'bilgi', 'çeviri', 'açıklama'],
  };

  async fetchWord(word: string): Promise<GraphPayload> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    const normalizedWord = normalizeWord(word);
    const related = MockDataSource.mockData[normalizedWord] || [];

    // Simulate some variation in results
    const shuffled = [...related].sort(() => Math.random() - 0.5);
    const maxResults = Math.min(15 + Math.floor(Math.random() * 5), shuffled.length);

    return {
      word: normalizedWord,
      related: shuffled.slice(0, maxResults)
    };
  }
}

/**
 * Supabase DataSource for production use
 * Connects to the dictionary table in Supabase
 */
export class SupabaseDataSource implements DataSource {
  async fetchWord(word: string): Promise<GraphPayload> {
    try {
      const normalizedWord = normalizeWord(word);
      const response = await fetch(`/api/graph?word=${encodeURIComponent(normalizedWord)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch word data');
      }

      return result.data || { word: normalizedWord, related: [] };
    } catch (error) {
      console.error('SupabaseDataSource error:', error);
      // Fallback to empty result instead of throwing
      return { word: normalizeWord(word), related: [] };
    }
  }
}

/**
 * Factory function to create the appropriate DataSource based on environment
 */
export function createDataSource(): DataSource {
  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';

  switch (dataSource.toLowerCase()) {
    case 'supabase':
      return new SupabaseDataSource();
    case 'mock':
    default:
      return new MockDataSource();
  }
}