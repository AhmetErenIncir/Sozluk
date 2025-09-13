# Sozluk - Turkish Dictionary Platform

A modern, multilingual dictionary application built with Next.js 15 and Supabase, featuring real-time search, user authentication, and admin-controlled word management.

## 🌟 Features

- **🔍 Real-time Search** - Instant word lookups with auto-suggestions
- **🔐 User Authentication** - Secure login/signup with Supabase Auth
- **👑 Admin System** - Role-based access for content management
- **🌐 Multi-language** - Support for multiple languages (Turkish primary)
- **📱 Responsive Design** - Mobile-first UI with Tailwind CSS
- **⚡ Performance** - Optimized with Next.js 15 and Server Components

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Sozluk

# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Documentation

- [**🚀 Getting Started**](./getting-started/) - Installation and setup guide
- [**🏛️ Architecture**](./architecture/) - System design and technical overview
- [**📱 User Guide**](./user-guide/) - How to use the application
- [**🛠️ API Reference**](./api/) - Backend API documentation
- [**🔧 Development**](./development/) - Developer guidelines and tools
- [**📝 Contributing**](./contributing/) - Contribution guidelines

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Supabase (Auth, Database, API)
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel (recommended)

## 📊 Project Status

| Component | Status |
|-----------|---------|
| Authentication | ✅ Complete |
| Word Search | ✅ Complete |
| Admin Panel | ✅ Complete |
| User Management | ✅ Complete |
| Mobile UI | ✅ Complete |
| Testing Suite | 🚧 In Progress |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./contributing/guidelines.md) for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.