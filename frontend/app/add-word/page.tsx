"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RelatedWordsSelect } from "@/components/RelatedWordsSelect"

export default function AddWord() {
  const { session, user, isAdmin, refreshSession } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form fields
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [relatedWords, setRelatedWords] = useState<string[]>([])
  const [language, setLanguage] = useState('tr')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [exampleSentences, setExampleSentences] = useState('')
  const [etymology, setEtymology] = useState('')
  const [pronunciation, setPronunciation] = useState('')

  // Check if user is admin on mount
  useEffect(() => {
    if (session && !isAdmin) {
      router.push('/')
    }
  }, [session, isAdmin, router])

  const handleSave = async () => {
    console.log('handleSave called')
    
    // Validation
    if (!word.trim() || !meaning.trim()) {
      setError('Kelime ve anlam alanları zorunludur!')
      return
    }

    // Check if user is authenticated
    if (!user?.id) {
      setError('Lütfen önce giriş yapın!')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('User ID:', user?.id)
      console.log('User Email:', user?.email)
      
      // Prepare data for API request
      const dictionaryEntry = {
        word: word.trim(),
        meaning: meaning.trim(),
        related_words: relatedWords || [],
        language,
        part_of_speech: partOfSpeech || null,
        example_sentences: exampleSentences ? exampleSentences.split('\n').map(s => s.trim()).filter(s => s) : [],
        etymology: etymology || null,
        pronunciation: pronunciation || null,
        user_id: user.id,
        user_email: user.email
      }

      console.log('Dictionary entry to save:', dictionaryEntry)

      // Use API route instead of direct Supabase call
      const response = await fetch('/api/dictionary/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dictionaryEntry),
      })

      const result = await response.json()

      console.log('API response:', result)

      if (!response.ok) {
        console.error('API error details:', result)
        if (response.status === 401) {
          setError('Lütfen önce giriş yapın!')
          // If unauthorized, redirect to login
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else if (response.status === 403) {
          setError('Yetki hatası: Bu işlemi gerçekleştirmek için yetkiniz yok.')
        } else if (response.status === 409) {
          setError('Bu kelime zaten eklenmiş.')
        } else {
          setError(`Kelime kaydedilirken bir hata oluştu: ${result.error || 'Bilinmeyen hata'}`)
        }
      } else if (result.success) {
        console.log('Successfully saved:', result.data)
        setSuccess(true)
        // Clear form
        setWord('')
        setMeaning('')
        setRelatedWords([])
        setLanguage('tr')
        setPartOfSpeech('')
        setExampleSentences('')
        setEtymology('')
        setPronunciation('')

        // Show success message for 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)

        // Refresh session to ensure auth state is clean
        await refreshSession()
      } else {
        console.log('No success in response')
        setError('Veri kaydedildi gibi görünüyor ancak doğrulama yapılamadı.')
      }
    } catch (err: unknown) {
      console.error('Unexpected error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(`Beklenmeyen bir hata oluştu: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Yeni Kelime Ekle</CardTitle>
            <CardDescription>
              Sözlüğe yeni bir kelime ve tanımı ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Kelime başarıyla kaydedildi!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Main Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="word">Kelime *</Label>
                <Input
                  id="word"
                  placeholder="Örn: Kitap"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meaning">Anlam *</Label>
                <Textarea
                  id="meaning"
                  placeholder="Kelimenin anlamını yazın..."
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Dil</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={loading}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Dil seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">İngilizce</SelectItem>
                      <SelectItem value="de">Almanca</SelectItem>
                      <SelectItem value="fr">Fransızca</SelectItem>
                      <SelectItem value="es">İspanyolca</SelectItem>
                      <SelectItem value="ar">Arapça</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">Kelime Türü</Label>
                  <Select value={partOfSpeech} onValueChange={setPartOfSpeech} disabled={loading}>
                    <SelectTrigger id="partOfSpeech">
                      <SelectValue placeholder="Kelime türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isim">İsim</SelectItem>
                      <SelectItem value="fiil">Fiil</SelectItem>
                      <SelectItem value="sıfat">Sıfat</SelectItem>
                      <SelectItem value="zarf">Zarf</SelectItem>
                      <SelectItem value="zamir">Zamir</SelectItem>
                      <SelectItem value="edat">Edat</SelectItem>
                      <SelectItem value="bağlaç">Bağlaç</SelectItem>
                      <SelectItem value="ünlem">Ünlem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pronunciation">Telaffuz</Label>
                <Input
                  id="pronunciation"
                  placeholder="Örn: ki-tap"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedWords">İlgili Kelimeler</Label>
                <RelatedWordsSelect
                  value={relatedWords}
                  onChange={setRelatedWords}
                  disabled={loading}
                  currentWord={word}
                  placeholder="Sözlükten ilgili kelimeleri seçin..."
                />
                <p className="text-sm text-gray-500">Sadece sözlükte mevcut olan kelimeler seçilebilir</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exampleSentences">Örnek Cümleler</Label>
                <Textarea
                  id="exampleSentences"
                  placeholder="Her satıra bir örnek cümle yazın..."
                  value={exampleSentences}
                  onChange={(e) => setExampleSentences(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">Her satıra bir örnek cümle yazın</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="etymology">Köken/Etimoloji</Label>
                <Textarea
                  id="etymology"
                  placeholder="Kelimenin kökeni hakkında bilgi..."
                  value={etymology}
                  onChange={(e) => setEtymology(e.target.value)}
                  rows={2}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                disabled={loading}
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
