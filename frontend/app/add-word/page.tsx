"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function AddWord() {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')

  const handleSave = () => {
    // For now, just log to console since no DB yet
    console.log({ word, meaning })
    // Optionally, clear fields or show success message
    setWord('')
    setMeaning('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Kelime Ekle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Kelime"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <Textarea
            placeholder="Anlamı"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            rows={5}
          />
          <Button onClick={handleSave} className="w-full">
            Kaydet
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}