# Installation Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Sozluk
```

### 2. Install Dependencies

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: You can get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

### 4. Database Setup

The application uses Supabase as the backend. Make sure your Supabase project has:

- **Tables**: `dictionary`, `profiles`
- **Row Level Security (RLS)** enabled
- **Authentication** configured

See [Database Schema](../architecture/database-schema.md) for detailed table structures.

## Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Build for Production

Create an optimized production build:

```bash
npm run build
npm run start
```

## Verification

To verify your installation:

1. Open [http://localhost:3000](http://localhost:3000)
2. Try the search functionality
3. Test user registration/login
4. Verify admin features (if you have admin access)

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or run on different port
npm run dev -- -p 3001
```

**Environment variables not loading:**
- Ensure `.env.local` is in the `frontend` directory
- Restart the development server after changes
- Check that variable names start with `NEXT_PUBLIC_`

**Supabase connection errors:**
- Verify your Supabase URL and API key
- Check your project's RLS policies
- Ensure your Supabase project is active

## Next Steps

- [Development Workflow](./development.md)
- [Environment Setup](./environment-setup.md)
- [Architecture Overview](../architecture/overview.md)