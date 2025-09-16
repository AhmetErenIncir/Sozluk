# Tech Context
## Technologies & Versions

### Core Framework
- **Next.js 14.1.0** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.3.3** - Type-safe development
- **Node.js 18+** - Runtime environment

### UI & Styling
- **Tailwind CSS 3.3.0** - Utility-first CSS
- **Shadcn UI** - Modern component library
- **Lucide React** - Icon library

### Visual Thesaurus Stack
- **react-force-graph-2d** - Force-directed graph visualization
- **d3-force** - Physics simulation engine
- **WebGL** - Hardware-accelerated canvas rendering
- **Zustand** - State management with persistence

### Backend & Data
- **Supabase** - PostgreSQL database and authentication
- **@supabase/supabase-js** - Supabase client
- **@supabase/ssr** - Server-side rendering support

### Development Tools
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

## Architecture Patterns

### Frontend Architecture
- **App Router**: Next.js 14+ file-based routing
- **Server Components**: Default rendering mode
- **Client Components**: Interactive UI with `"use client"`
- **API Routes**: Backend logic in `/app/api`

### State Management
- **Zustand**: Lightweight state for graph data
- **React Context**: Authentication state
- **Local Storage**: Persistence layer
- **URL State**: Query parameters for navigation

### Data Flow
```
User Input → GraphControls → API Route → Data Source → Graph Store → GraphCanvas
```

## Setup & Run

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (for production)
- Modern browser with WebGL support

### Frontend Setup
```bash
# Clone repository
git clone <repository-url>
cd Sozluk/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Development server
npm run dev

# Production build
npm run build
npm run start
```

### Database Setup (Supabase)
1. Create Supabase project
2. Run migration scripts (in `/supabase/migrations`)
3. Configure RLS policies
4. Add sample data

## Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Optional Graph Configuration
NEXT_PUBLIC_GRAPH_NODE_LIMIT=50
NEXT_PUBLIC_GRAPH_LINK_DISTANCE=300
NEXT_PUBLIC_GRAPH_CHARGE_STRENGTH=-4000
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

## Performance Constraints

### Graph Rendering
- **Node Limit**: 50 nodes (configurable)
- **Link Distance**: 300px base (multiplied by 4.5)
- **Charge Strength**: -4000 (strong repulsion)
- **Target FPS**: 60 FPS for interactions
- **Memory Budget**: <100MB for graph data

### API Limits
- **Request Size**: 1MB max
- **Response Time**: <500ms target
- **Cache Duration**: 5 minutes
- **Rate Limiting**: 100 req/min (public)

### Browser Requirements
- **WebGL**: Required for graph rendering
- **ES2022**: Modern JavaScript features
- **UTF-8**: Full Unicode support
- **Viewport**: Minimum 320px width

## Security Considerations
- Supabase Row Level Security (RLS) enabled
- API routes validate authentication
- Input sanitization for Turkish characters
- XSS protection via React
- CORS configured for production domain

## Deployment Considerations

### Vercel Deployment
- Automatic deployments from main branch
- Environment variables in Vercel dashboard
- Edge functions for API routes
- Static optimization for pages

### Performance Optimization
- ISR (Incremental Static Regeneration) for dictionary pages
- Dynamic imports for graph components
- Image optimization with next/image
- Font optimization with next/font

## Technical Decisions

### Why react-force-graph-2d?
- WebGL performance for large graphs
- Extensive customization options
- Active maintenance and community
- Good TypeScript support

### Why Zustand over Redux?
- Simpler API
- Less boilerplate
- Built-in persistence
- Better TypeScript inference

### Why Supabase?
- PostgreSQL with real-time capabilities
- Built-in authentication
- Row Level Security
- Good Next.js integration

## Known Limitations
- Graph performance degrades beyond 100 nodes
- WebGL required (no fallback currently)
- Turkish locale support varies by browser
- Mobile gesture support limited

## Future Considerations
- WebAssembly for graph calculations
- Service Worker for offline support
- GraphQL API migration
- Internationalization (i18n)
- Progressive Web App (PWA)

## Changelog
- 2024-01-15: Added Visual Thesaurus tech stack
- 2024-01-14: Integrated Zustand and graph libraries
- 2024-01-10: Supabase configuration added
- 2024-07-30: Initial tech context created