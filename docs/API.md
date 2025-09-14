# API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the Sözlük application, with a focus on the Visual Thesaurus graph API and related services.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
API endpoints use Supabase authentication. Include the authentication token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## Graph API Endpoints

### Get Graph Data
Retrieves word relationship data for the Visual Thesaurus graph visualization.

**Endpoint:** `GET /api/graph`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| word | string | Yes | The Turkish word to center the graph around |
| limit | number | No | Maximum number of nodes to return (default: 50) |
| depth | number | No | Relationship depth to explore (default: 2) |

**Request Example:**
```http
GET /api/graph?word=kitap&limit=30&depth=2
```

**Response Structure:**
```typescript
interface GraphResponse {
  nodes: GraphNode[]
  links: GraphLink[]
  metadata?: {
    totalNodes: number
    totalLinks: number
    timestamp: string
  }
}

interface GraphNode {
  id: string
  word: string
  isCenter?: boolean
  definition?: string
  partOfSpeech?: string
  frequency?: number
}

interface GraphLink {
  source: string  // Node ID
  target: string  // Node ID
  relationshipType: 'synonym' | 'antonym' | 'related' | 'derived'
  strength?: number  // 0-1, relationship strength
  bidirectional?: boolean
}
```

**Success Response (200 OK):**
```json
{
  "nodes": [
    {
      "id": "node_1",
      "word": "kitap",
      "isCenter": true,
      "definition": "Basılı veya dijital okuma materyali",
      "partOfSpeech": "isim",
      "frequency": 0.89
    },
    {
      "id": "node_2",
      "word": "roman",
      "definition": "Uzun anlatı türü",
      "partOfSpeech": "isim",
      "frequency": 0.76
    },
    {
      "id": "node_3",
      "word": "dergi",
      "definition": "Periyodik yayın",
      "partOfSpeech": "isim",
      "frequency": 0.65
    }
  ],
  "links": [
    {
      "source": "node_1",
      "target": "node_2",
      "relationshipType": "related",
      "strength": 0.8,
      "bidirectional": true
    },
    {
      "source": "node_1",
      "target": "node_3",
      "relationshipType": "related",
      "strength": 0.6,
      "bidirectional": true
    }
  ],
  "metadata": {
    "totalNodes": 3,
    "totalLinks": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Missing word parameter:**
```json
{
  "error": "Word parameter is required",
  "code": "MISSING_PARAMETER"
}
```

**404 Not Found - Word not in dictionary:**
```json
{
  "error": "Word not found in dictionary",
  "code": "WORD_NOT_FOUND",
  "word": "invalidword"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch graph data",
  "code": "INTERNAL_ERROR"
}
```

### Implementation Notes
- The API uses Turkish locale for text normalization
- Results are cached for 5 minutes to improve performance
- Node limits prevent overwhelming the client with too much data
- Relationship strength is calculated based on semantic similarity

---

## Dictionary API Endpoints

### Search Words
Search for words in the dictionary with autocomplete support.

**Endpoint:** `GET /api/dictionary/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (minimum 2 characters) |
| limit | number | No | Maximum results (default: 10, max: 50) |
| exact | boolean | No | Exact match only (default: false) |

**Response:**
```json
{
  "results": [
    {
      "id": "1",
      "word": "kitap",
      "definition": "Basılı veya dijital okuma materyali",
      "partOfSpeech": "isim"
    }
  ],
  "total": 25
}
```

### Get Word Definition
Get detailed definition and information for a specific word.

**Endpoint:** `GET /api/dictionary/word/{word}`

**Response:**
```json
{
  "word": "kitap",
  "definitions": [
    {
      "meaning": "Basılı veya dijital okuma materyali",
      "example": "Bu kitabı dün bitirdim.",
      "partOfSpeech": "isim"
    }
  ],
  "etymology": "Arapça kitāb kelimesinden",
  "pronunciation": "ki.tap",
  "synonyms": ["eser", "yapıt"],
  "antonyms": [],
  "relatedWords": ["kitaplık", "kitapçı", "kitapsever"]
}
```

---

## Authentication API Endpoints

### Login
Authenticate user and receive access token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "user"
  },
  "session": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_at": 1234567890
  }
}
```

### Logout
End user session.

**Endpoint:** `POST /api/auth/logout`

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

## Admin API Endpoints

### Add Word
Add a new word to the dictionary (Admin only).

**Endpoint:** `POST /api/admin/words`

**Request Body:**
```json
{
  "word": "yeni",
  "definitions": [
    {
      "meaning": "Henüz var olmaya başlamış",
      "example": "Yeni bir gün başlıyor.",
      "partOfSpeech": "sıfat"
    }
  ],
  "synonyms": ["taze", "modern"],
  "antonyms": ["eski", "kadim"]
}
```

### Update Word
Update existing word information (Admin only).

**Endpoint:** `PUT /api/admin/words/{id}`

### Delete Word
Remove a word from the dictionary (Admin only).

**Endpoint:** `DELETE /api/admin/words/{id}`

---

## Rate Limiting
- Public endpoints: 100 requests per minute
- Authenticated endpoints: 500 requests per minute
- Admin endpoints: 1000 requests per minute

## Error Codes
| Code | Description |
|------|-------------|
| MISSING_PARAMETER | Required parameter not provided |
| INVALID_PARAMETER | Parameter value is invalid |
| WORD_NOT_FOUND | Requested word doesn't exist |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Insufficient permissions |
| RATE_LIMITED | Too many requests |
| INTERNAL_ERROR | Server error occurred |

## Data Sources
The API can use multiple data sources based on configuration:

### Mock Data Source (Development)
- Returns predefined test data
- No database connection required
- Useful for frontend development

### Supabase Data Source (Production)
- Connects to PostgreSQL via Supabase
- Real-time data updates
- Full CRUD operations

## WebSocket Events (Future)
Planned real-time features:
- Live graph updates
- Collaborative word exploration
- Real-time search suggestions

## SDK Examples

### JavaScript/TypeScript
```typescript
// Using fetch
const response = await fetch('/api/graph?word=kitap', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Using axios
import axios from 'axios';

const { data } = await axios.get('/api/graph', {
  params: { word: 'kitap' },
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Python
```python
import requests

response = requests.get(
  'http://localhost:3000/api/graph',
  params={'word': 'kitap'},
  headers={'Authorization': f'Bearer {token}'}
)
data = response.json()
```

## Changelog
- **v1.0.0** - Initial API release with graph endpoint
- **v1.1.0** - Added dictionary search and word endpoints
- **v1.2.0** - Added admin management endpoints
- **v1.3.0** - Enhanced graph API with relationship types

## Support
For API issues or questions, please contact the development team or open an issue in the repository.