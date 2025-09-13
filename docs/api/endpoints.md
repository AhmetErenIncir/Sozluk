# API Reference

## Base URL

All API endpoints are relative to your application's base URL:
```
https://your-app.vercel.app/api
```

## Authentication

Most endpoints require user authentication. Include the user's session in your requests when calling from the client side.

## Endpoints

### Dictionary Words

#### GET `/api/dictionary/words`

Retrieves dictionary words with optional search and pagination.

**Parameters:**
- `search` (optional): Search term to filter words
- `limit` (optional): Maximum number of results (default: 100)

**Example Request:**
```javascript
// Get all words
const response = await fetch('/api/dictionary/words')

// Search for specific words
const response = await fetch('/api/dictionary/words?search=hello&limit=50')
```

**Response:**
```json
{
  "words": [
    {
      "id": 1,
      "word": "merhaba",
      "language": "tr"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal server error

---

#### POST `/api/dictionary/words`

Creates a new dictionary entry.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "word": "example",
  "meaning": "A sample or illustration",
  "language": "en",
  "part_of_speech": "noun",
  "related_words": ["sample", "illustration"],
  "example_sentences": ["This is an example sentence."],
  "etymology": "From Latin exemplum",
  "pronunciation": "/ɪɡˈzæmpəl/",
  "user_id": "uuid-string",
  "user_email": "user@example.com"
}
```

**Required Fields:**
- `word` - The word to add
- `meaning` - Definition of the word
- `user_id` - ID of the authenticated user

**Optional Fields:**
- `language` - Language code (default: 'tr')
- `part_of_speech` - Grammatical category
- `related_words` - Array of related words
- `example_sentences` - Array of usage examples
- `etymology` - Word origin/history
- `pronunciation` - Phonetic pronunciation
- `user_email` - User's email address

**Example Request:**
```javascript
const response = await fetch('/api/dictionary/words', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    word: 'örnek',
    meaning: 'Bir şeyin nasıl olduğunu göstermek için verilen misal',
    language: 'tr',
    part_of_speech: 'isim',
    user_id: session.user.id,
    user_email: session.user.email
  })
})
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "word": "örnek",
    "meaning": "Bir şeyin nasıl olduğunu göstermek için verilen misal",
    "language": "tr",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (user not authenticated)
- `403` - Forbidden (user not admin)
- `409` - Conflict (word already exists)
- `500` - Internal server error

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE" // Optional
}
```

## Rate Limiting

API requests are rate limited by Supabase. Current limits:
- 100 requests per minute per user
- 1000 requests per hour per IP

## Examples

### Adding a Word (Complete Example)

```javascript
// Client-side example using the AuthProvider
import { useAuth } from '@/components/AuthProvider'

function AddWordForm() {
  const { user } = useAuth()

  const addWord = async (wordData) => {
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const response = await fetch('/api/dictionary/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...wordData,
        user_id: user.id,
        user_email: user.email
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add word')
    }

    return await response.json()
  }
}
```

### Searching Words

```javascript
const searchWords = async (searchTerm, limit = 10) => {
  const params = new URLSearchParams({
    search: searchTerm,
    limit: limit.toString()
  })

  const response = await fetch(`/api/dictionary/words?${params}`)
  const data = await response.json()

  return data.words
}

// Usage
const results = await searchWords('merhaba', 20)
console.log(results)
```

## Next Steps

- [Authentication API](./authentication.md)
- [Frontend Integration](../development/component-guide.md)
- [Error Handling](../development/testing.md)