# Trae.ai - Dictionary Project

## Overview

This project is a modern, interactive Turkish dictionary application with full user authentication, administrative word management, and comprehensive search capabilities. The application features a clean UI built with Next.js and is powered by Supabase for backend services.

## Project Structure

- `frontend/`: Contains the Next.js application with TypeScript, Tailwind CSS, and Shadcn UI components
- `memory-bank/`: Contains project context, decisions, and progress tracking
- **Database**: Supabase-hosted PostgreSQL with authentication and real-time capabilities

## Key Features Implemented

- **User Authentication**: Complete signup/login system with session management
- **Admin Management**: Role-based access control with admin-only features
- **Word Management**: Full CRUD operations for dictionary entries with rich metadata
- **Search Functionality**: Real-time word search with language filtering
- **Responsive Design**: Mobile-first approach with modern UI components

## Quick Start (Frontend)

1. Navigate to the `frontend/` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server: `npm run dev`

## Dependencies

- **Frontend Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 3.3.0
- **UI Components**: Shadcn UI with Radix primitives
- **Icons**: Lucide React
- **Backend Services**: Supabase (authentication, database, real-time)
- **Form Handling**: React Hook Form with validation
- **Routing**: Next.js App Router with server and client components

## Database Schema

- **dictionary**: Main word storage with fields for word, meaning, language, part of speech, etymology, pronunciation, example sentences, and related words
- **profiles**: User management with admin flags and email tracking
- **Authentication**: Handled by Supabase Auth with automatic profile creation

## Architecture Highlights

- **Client-Side Authentication**: Consistent session management without server/client conflicts
- **API Routes**: RESTful endpoints for word management with proper error handling
- **Session Refresh**: Automatic auth state synchronization and recovery
- **Protected Routes**: Admin-only access with automatic redirects
- **Error Boundaries**: Comprehensive error handling and user feedback

## Recent Major Updates

- **Session Management Fix**: Resolved logout issues after word operations
- **API Architecture**: Simplified authentication flow for better reliability
- **Word Management**: Complete CRUD system with rich metadata support
- **Admin Interface**: Dedicated admin features with proper access control
- **UI Enhancements**: Improved navigation and user experience

## Memory Bank Rules

For detailed project context, architecture, and progress, refer to the `memory-bank/` directory. The following files are maintained:

- `projectbrief.md`: Purpose, vision, scope, and success criteria
- `productContext.md`: Problem definition, users, usage scenarios, and UX goals
- `systemPatterns.md`: Architecture overview, design patterns, and critical paths
- `techContext.md`: Technologies, setup instructions, and constraints
- `activeContext.md`: Current focus, recent changes, decisions, and open questions
- `progress.md`: Status summary, prioritized to-do list, known issues, and milestones
