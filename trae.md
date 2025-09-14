# Sözlük - Turkish Interactive Dictionary & Visual Thesaurus

## Overview
A modern, interactive Turkish dictionary application featuring an innovative Visual Thesaurus graph visualization. The application provides traditional dictionary functionality enhanced with an interactive word relationship explorer that allows users to visually navigate through Turkish language connections.

## 🎯 Key Features

### Dictionary Features
- **Word Search & Definitions**: Comprehensive Turkish word lookup with detailed definitions
- **User Authentication**: Secure login system with Supabase authentication
- **Admin Management**: Administrative interface for managing dictionary entries
- **User Profiles**: Personalized user experience with role-based access

### 🌟 Visual Thesaurus Graph (New!)
- **Interactive Graph Visualization**: Explore word relationships through an interactive force-directed graph
- **Click-to-Navigate**: Click any word node to recenter the graph and explore its connections
- **Smart Text Positioning**: Advanced collision detection ensures no overlapping text
- **Turkish Language Support**: Full support for Turkish characters (İ/ı, Ğ/ğ, Ş/ş, etc.)
- **Performance Optimized**: WebGL-powered rendering with configurable physics simulation
- **History Navigation**: Breadcrumb trail and back button for easy navigation
- **Search Integration**: Find and explore any word in the dictionary

## Project Structure
```
Sozluk/
├── frontend/                 # Next.js 14+ application
│   ├── app/                 # App Router pages and API routes
│   │   ├── graph/          # Visual Thesaurus page
│   │   └── api/            # API endpoints
│   ├── components/         # React components
│   │   ├── GraphView.tsx   # Main graph visualization
│   │   ├── GraphCanvas.tsx # Canvas rendering engine
│   │   └── GraphControls.tsx # Search and controls
│   ├── lib/               # Utilities and helpers
│   │   ├── graph-positioning.ts # Text positioning algorithms
│   │   ├── graph-types.ts      # TypeScript definitions
│   │   └── datasource.ts       # Data source abstractions
│   └── store/             # State management (Zustand)
├── backend/               # (Planned) Backend API services
└── memory-bank/          # Project documentation
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for production data)
- Modern browser with WebGL support

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sozluk
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Access Visual Thesaurus**
   Navigate to [http://localhost:3000/graph](http://localhost:3000/graph)

## Technology Stack

### Core Framework
- **Next.js 14.1.0**: React framework with App Router
- **React 18.2.0**: UI library
- **TypeScript 5.3.3**: Type-safe development

### UI & Styling
- **Tailwind CSS 3.3.0**: Utility-first CSS framework
- **Shadcn UI**: Modern component library
- **Lucide React**: Icon library

### Visual Thesaurus Technologies
- **react-force-graph-2d**: Force-directed graph visualization
- **d3-force**: Physics simulation engine
- **WebGL Canvas**: Hardware-accelerated rendering
- **Zustand**: State management with persistence

### Backend & Data
- **Supabase**: Authentication and PostgreSQL database
- **@supabase/ssr**: Server-side rendering support

## Visual Thesaurus Features

### Graph Navigation
- **Interactive Nodes**: Click any word to make it the center
- **Relationship Exploration**: See synonyms, antonyms, and related words
- **Visual Hierarchy**: Center nodes highlighted with glow effects
- **Smart Layout**: Automatic positioning prevents overlap

### Performance Features
- **Graph Pruning**: Limits nodes for optimal performance
- **Physics Toggle**: Enable/disable force simulation
- **Configurable Spacing**: Adjust node distances
- **Debounced Search**: Optimized search performance

### Turkish Language Support
- **Character Normalization**: Proper handling of İ/ı, Ğ/ğ, Ş/ş
- **Locale-Aware Search**: Case-insensitive Turkish text matching
- **Unicode Support**: Full UTF-8 character support

## Recent Updates

### Visual Thesaurus Implementation (Latest)
- ✅ Full interactive graph with WebGL rendering
- ✅ Click-to-recenter navigation system
- ✅ Smart text positioning with collision detection
- ✅ Enhanced force simulation (4000 charge strength)
- ✅ Turkish language normalization utilities
- ✅ Performance optimization and graph pruning
- ✅ Comprehensive state management with Zustand
- ✅ Responsive design for all screen sizes

### Previous Updates
- Supabase authentication implementation
- User profiles with admin roles
- Admin dashboard functionality
- Navbar improvements and navigation
- Initial dictionary search interface

## Development Guidelines

### Commit Convention
- `feat(scope):` New features
- `fix(scope):` Bug fixes
- `docs(scope):` Documentation updates
- `refactor(scope):` Code refactoring
- `test(scope):` Test additions/changes

### Code Style
- TypeScript with strict mode enabled
- ESLint with Next.js configuration
- 2-space indentation
- Named exports preferred

## Documentation

### Project Documentation
- **[Architecture Guide](./docs/ARCHITECTURE.md)**: System design and component structure
- **[API Documentation](./docs/API.md)**: REST API endpoints and data models
- **[User Guide](./docs/USER_GUIDE.md)**: How to use the Visual Thesaurus
- **[Development Guide](./docs/DEVELOPMENT.md)**: Setup and contribution guidelines
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Production deployment instructions

### Memory Bank
For detailed project context and decisions:
- `memory-bank/projectbrief.md`: Vision and scope
- `memory-bank/productContext.md`: User needs and UX goals
- `memory-bank/systemPatterns.md`: Architecture patterns
- `memory-bank/techContext.md`: Technology decisions
- `memory-bank/activeContext.md`: Current development focus
- `memory-bank/progress.md`: Project status and milestones

## Contributing
Please read our contributing guidelines before submitting pull requests. Ensure all tests pass and follow the commit conventions.

## License
[License information to be added]

## Support
For issues, questions, or suggestions, please open an issue in the repository.