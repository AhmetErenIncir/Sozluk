# Sözlük Frontend - Next.js Application

## Overview
The frontend application for Sözlük, a modern Turkish dictionary with an innovative Visual Thesaurus graph visualization. Built with Next.js 14+ App Router, TypeScript, and featuring a WebGL-powered interactive word relationship explorer.

## 🚀 Features

### Core Dictionary
- **Word Search**: Fast, responsive search with Turkish character support
- **Definitions Display**: Comprehensive word definitions and meanings
- **User Authentication**: Secure Supabase-powered authentication
- **Admin Panel**: Content management interface for administrators

### Visual Thesaurus Graph
- **Interactive Visualization**: Force-directed graph with WebGL rendering
- **Click Navigation**: Click any word node to explore its connections
- **Smart Text Positioning**: Advanced collision detection prevents overlap
- **Performance Optimized**: Configurable physics and node limits
- **History Management**: Breadcrumb navigation and back button
- **Turkish Language Support**: Full support for İ/ı, Ğ/ğ, Ş/ş characters

## 🛠 Technology Stack

### Core Technologies
```json
{
  "next": "14.1.0",
  "react": "18.2.0",
  "typescript": "5.3.3",
  "tailwindcss": "3.3.0"
}
```

### UI Libraries
- **Shadcn UI**: Modern, accessible component library
- **Lucide React**: Comprehensive icon set
- **react-force-graph-2d**: Graph visualization engine
- **d3-force**: Physics simulation for graph layout

### State & Data
- **Zustand**: Lightweight state management with persistence
- **Supabase**: Authentication and PostgreSQL database
- **@supabase/ssr**: Server-side rendering support

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── graph/               # Visual Thesaurus page
│   │   └── page.tsx        # Graph interface with URL query support
│   ├── api/                # API routes
│   │   └── graph/          # Graph data endpoints
│   │       └── route.ts    # GET endpoint for graph data
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Home page
│
├── components/              # React components
│   ├── graph/              # Graph-specific components
│   │   ├── GraphView.tsx   # Main graph integration
│   │   ├── GraphCanvas.tsx # Canvas rendering engine
│   │   ├── GraphControls.tsx # Search and settings
│   │   └── Breadcrumb.tsx  # Navigation history
│   ├── ui/                 # Shadcn UI components
│   └── providers/          # Context providers
│
├── lib/                     # Utilities and helpers
│   ├── graph/              # Graph utilities
│   │   ├── graph-positioning.ts # Text positioning algorithms
│   │   ├── graph-types.ts      # TypeScript definitions
│   │   └── graph-utils.ts      # Helper functions
│   ├── datasource/         # Data abstractions
│   │   ├── datasource.ts   # Data source interface
│   │   ├── mock.ts         # Mock data for development
│   │   └── supabase.ts    # Supabase integration
│   ├── text-utils.ts       # Turkish text processing
│   └── supabase/           # Supabase clients
│
├── store/                   # State management
│   └── graph-store.ts      # Zustand store for graph
│
├── styles/                  # Global styles
│   └── globals.css         # Tailwind directives
│
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (for production)
- Modern browser with WebGL support

### Installation

1. **Clone and navigate to frontend**
   ```bash
   git clone <repository-url>
   cd Sozluk/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` file:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Optional: Graph Configuration
   NEXT_PUBLIC_GRAPH_NODE_LIMIT=50
   NEXT_PUBLIC_GRAPH_LINK_DISTANCE=300
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Production Build**
   ```bash
   npm run build
   npm run start
   ```

## 📊 Visual Thesaurus Graph

### Accessing the Graph
Navigate to `/graph` or append `?word=kelime` for direct word lookup:
- Development: [http://localhost:3000/graph](http://localhost:3000/graph)
- With word: [http://localhost:3000/graph?word=kitap](http://localhost:3000/graph?word=kitap)

### Graph Controls
- **Search**: Type to search, press Enter or click button
- **Navigation**: Click any word node to recenter
- **Back**: Use browser back or breadcrumb navigation
- **Settings**: Toggle physics, adjust spacing
- **Mode**: "Expand" adds to current graph, "New" replaces

### Technical Implementation

#### Force Simulation Configuration
```typescript
const simulation = d3.forceSimulation()
  .force("charge", d3.forceManyBody().strength(-4000))
  .force("link", d3.forceLink().distance(d => d.distance * 4.5))
  .force("center", d3.forceCenter())
  .force("collision", d3.forceCollide().radius(60))
```

#### Text Positioning System
The graph uses a sophisticated 12-strategy positioning system:
1. Top, Bottom, Left, Right positions
2. Diagonal positions (8 variations)
3. Collision detection and avoidance
4. Dynamic font scaling with zoom

#### Turkish Text Processing
```typescript
// Normalization for Turkish locale
const normalizedText = text
  .toLowerCase('tr-TR')
  .replace(/İ/g, 'i')
  .replace(/I/g, 'ı')
  // ... other replacements
```

## 🔌 API Endpoints

### Graph Data Endpoint
```
GET /api/graph?word={word}

Response:
{
  "nodes": [
    { "id": "1", "word": "kitap", "isCenter": true }
  ],
  "links": [
    { "source": "1", "target": "2", "relationshipType": "synonym" }
  ]
}
```

## 🎨 Component Architecture

### GraphView Component
Main integration point that combines:
- `GraphCanvas`: WebGL rendering layer
- `GraphControls`: User interface controls
- `Breadcrumb`: Navigation history
- Zustand store for state management

### State Management
```typescript
interface GraphState {
  nodes: GraphNode[]
  links: GraphLink[]
  history: string[]
  settings: {
    nodeLimit: number
    linkDistance: number
    chargeStrength: number
    enablePhysics: boolean
  }
}
```

## 🧪 Development Tools

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler
```

### Mock Data Mode
For development without Supabase:
```typescript
// lib/datasource/datasource.ts
const source = process.env.NODE_ENV === 'development'
  ? new MockDataSource()
  : new SupabaseDataSource()
```

## 🚀 Performance Optimization

### Graph Optimization
- **Node Limiting**: Configurable max nodes (default: 50)
- **Link Distance**: Adjustable spacing (default: 300px)
- **Physics Toggle**: Disable simulation for static viewing
- **Debounced Search**: 300ms delay for better UX
- **Canvas Rendering**: Hardware-accelerated WebGL

### Build Optimization
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next/font with Geist font
- **Tree Shaking**: Automatic with production build

## 🐛 Troubleshooting

### Known Issues and Fixes
See `docs/BUGFIXES.md` for detailed documentation of known issues and their fixes.

### Common Issues

1. **Graph not rendering**
   - Check WebGL support in browser
   - Verify data source configuration
   - Check console for errors

2. **Turkish characters not working**
   - Ensure UTF-8 encoding
   - Check locale settings
   - Verify text normalization

3. **Performance issues**
   - Reduce node limit
   - Disable physics simulation
   - Check browser GPU acceleration

## 📝 Code Style

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["dom", "ES2022"],
    "jsx": "preserve"
  }
}
```

### ESLint Rules
- Extends `next/core-web-vitals`
- Custom rules for consistent code style
- Pre-commit hooks recommended

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Maintenance

## 📄 License
[License information to be added]

## 🆘 Support
For issues or questions, please open an issue in the repository.