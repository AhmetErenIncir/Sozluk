// Graph page with URL query support and SEO optimization
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraphView } from '@/components/GraphView';
import { normalizeWord, isValidWord } from '@/lib/text-utils';

/**
 * Inner component to handle search params (must be wrapped in Suspense)
 */
function GraphPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initialWord, setInitialWord] = useState<string>('kitap');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get word from URL query parameter
    const queryWord = searchParams.get('q') || searchParams.get('word');

    if (queryWord) {
      const normalizedQuery = normalizeWord(queryWord);
      if (isValidWord(normalizedQuery)) {
        setInitialWord(normalizedQuery);
      } else {
        // Invalid query, redirect to default
        router.replace('/graph?q=kitap');
        setInitialWord('kitap');
      }
    } else {
      // No query parameter, set default
      setInitialWord('kitap');
    }

    setIsInitialized(true);
  }, [searchParams, router]);

  // Update URL when initial word changes (for sharing/bookmarking)
  useEffect(() => {
    if (isInitialized && initialWord) {
      const currentQuery = searchParams.get('q');
      if (currentQuery !== initialWord) {
        const newUrl = `/graph?q=${encodeURIComponent(initialWord)}`;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [initialWord, isInitialized, searchParams]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg font-semibold">Görsel Sözlük Yükleniyor</div>
          <div className="text-muted-foreground">Graf arayüzü hazırlanıyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <GraphView
        initialWord={initialWord}
        className="flex-1"
      />
    </div>
  );
}

/**
 * Loading component for the Suspense boundary
 */
function GraphPageLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-lg font-semibold">Görsel Sözlük</div>
        <div className="text-muted-foreground">Graf arayüzü hazırlanıyor...</div>
      </div>
    </div>
  );
}

/**
 * Main Graph page component
 *
 * URL Parameters:
 * - ?q=word or ?word=word: Initial word to display
 *
 * Examples:
 * - /graph?q=kitap
 * - /graph?word=sevgi
 * - /graph (defaults to 'kitap')
 */
export default function GraphPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="sr-only">
        <h1>Görsel Sözlük - Kelime İlişkileri Grafiği</h1>
        <p>
          Kelimeleri ve aralarındaki anlamsal ilişkileri görselleştiren interaktif graf arayüzü.
          Visual Thesaurus tarzında kelime keşfi deneyimi.
        </p>
      </div>

      {/* Main Graph Interface */}
      <Suspense fallback={<GraphPageLoading />}>
        <GraphPageContent />
      </Suspense>

      {/* Accessibility and SEO improvements */}
      <div className="sr-only">
        <nav aria-label="Graf kullanım talimatları">
          <h2>Nasıl Kullanılır</h2>
          <ul>
            <li>Bir kelimeye tıklayarak o kelimeyi merkez yapabilirsiniz</li>
            <li>Arama kutusundan yeni kelimeler ekleyebilirsiniz</li>
            <li>Geri butonu ile önceki merkezlere dönebilirsiniz</li>
            <li>Ayarlar menüsünden graf boyutlarını değiştirebilirsiniz</li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

