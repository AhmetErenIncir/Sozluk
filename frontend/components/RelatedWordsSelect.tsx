"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Word {
  id: string
  word: string
  language: string
}

interface RelatedWordsSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
  currentWord?: string // To exclude the current word being added from the list
}

export function RelatedWordsSelect({
  value = [],
  onChange,
  disabled = false,
  placeholder = "İlgili kelimeleri seçin...",
  currentWord = ""
}: RelatedWordsSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [words, setWords] = React.useState<Word[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Fetch words from API
  const fetchWords = React.useCallback(async (search: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/dictionary/words?search=${encodeURIComponent(search)}&limit=50`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch words')
      }
      
      const data = await response.json()
      // Filter out the current word being added and already selected words
      const filteredWords = (data.words || []).filter((word: Word) => 
        word.word.toLowerCase() !== currentWord.toLowerCase()
      )
      setWords(filteredWords)
    } catch (error) {
      console.error('Error fetching words:', error)
      setWords([])
    } finally {
      setLoading(false)
    }
  }, [currentWord])

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchWords(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, fetchWords])

  // Initial load
  React.useEffect(() => {
    fetchWords("")
  }, [fetchWords])

  const handleSelect = (selectedWord: string) => {
    const isSelected = value.includes(selectedWord)
    if (isSelected) {
      onChange(value.filter(w => w !== selectedWord))
    } else {
      onChange([...value, selectedWord])
    }
  }

  const handleRemove = (wordToRemove: string) => {
    onChange(value.filter(w => w !== wordToRemove))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            <span className="truncate">
              {value.length > 0
                ? `${value.length} kelime seçildi`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Kelime ara..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              {loading ? "Yükleniyor..." : "Kelime bulunamadı."}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {words.map((word) => (
                <CommandItem
                  key={word.id}
                  value={word.word}
                  onSelect={() => handleSelect(word.word)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(word.word) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{word.word}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {word.language === 'tr' ? 'TR' : 
                     word.language === 'en' ? 'EN' :
                     word.language === 'de' ? 'DE' :
                     word.language === 'fr' ? 'FR' :
                     word.language === 'es' ? 'ES' :
                     word.language === 'ar' ? 'AR' : word.language.toUpperCase()}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected words as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((word) => (
            <Badge
              key={word}
              variant="secondary"
              className="pl-2 pr-1 py-1"
            >
              {word}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 px-1 hover:bg-transparent"
                onClick={() => handleRemove(word)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
