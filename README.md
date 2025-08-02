# TryOn.ai - Virtual Fashion Try-On Platform

A modern React-based virtual try-on platform powered by AI, featuring real-time authentication and intelligent styling recommendations.

## 🚀 Features

- **AI-Powered Virtual Try-On**: Upload your photo and see how clothes look on you
- **Real Authentication**: Secure user authentication with Supabase
- **Subscription Management**: Tiered access with free and premium plans
- **Responsive Design**: Beautiful, mobile-first design with Tailwind CSS
- **Real-time Updates**: Live authentication state management
- **Production Ready**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4 Vision API
- **State Management**: Zustand
- **UI Components**: Headless UI, Heroicons
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- OpenAI API key (optional, falls back to demo mode)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd tryon-ai
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI API Configuration (optional)
VITE_OPENAI_API_KEY=your-openai-api-key

# App Configuration
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
```

3. Enable email authentication in Supabase Auth settings

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 Configuration

### Supabase Setup

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: 
   - Project URL: Found in Settings > API
   - Anon Key: Found in Settings > API
3. **Database Schema**: Run the migration file in SQL Editor
4. **Authentication**: Enable Email provider in Authentication > Providers

### OpenAI Setup (Optional)

1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env.local` as `VITE_OPENAI_API_KEY`
3. Without API key, the app runs in demo mode with mock AI responses

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with auth state
│   ├── ProductSelector.jsx
│   └── VirtualResult.jsx
├── pages/              # Route components
│   ├── Home.jsx
│   ├── Login.jsx       # Authentication pages
│   ├── Register.jsx
│   └── VirtualTryOn.jsx # Main try-on feature
├── services/           # API and business logic
│   ├── auth.js         # Supabase authentication
│   └── ai.js           # AI integration
├── store/              # State management
│   ├── authStore.js    # Authentication state
│   └── tryOnStore.js   # Try-on session state
├── lib/                # Utilities and configuration
│   └── supabase.js     # Supabase client setup
└── App.jsx             # Main app component
```

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with email/password
2. **Email Verification**: Supabase sends verification emails
3. **Session Management**: Automatic session restoration on app load
4. **Protected Routes**: Virtual try-on requires authentication
5. **Subscription Gates**: Premium features require active subscription

## 🤖 AI Integration

The platform supports multiple AI integration modes:

### Production Mode (OpenAI API Key Required)
- Uses GPT-4 Vision API for real image analysis
- Provides detailed fit and style recommendations
- Analyzes color compatibility and styling suggestions

### Demo Mode (Fallback)
- Intelligent mock responses with realistic feedback
- No API key required for development/testing
- Maintains full UI functionality

## 🚀 Deployment

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_APP_ENV=production
VITE_APP_URL=https://your-domain.com
```

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production build ready for deployment.

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: Protected routes and API calls
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Session Management**: Secure token handling and automatic refresh

## 📊 Database Schema

### Core Tables

- **profiles**: User profiles with subscription info
- **try_on_sessions**: Virtual try-on history and results
- **user_preferences**: Styling preferences and settings

### Key Features

- Automatic profile creation on user registration
- Subscription status tracking with expiration dates
- Try-on session logging for analytics
- User preference storage for personalization

## 🎨 Styling and UI

- **Design System**: Consistent color palette and typography
- **Responsive**: Mobile-first design with breakpoint optimization
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: ARIA labels and keyboard navigation support
- **Loading States**: Comprehensive loading and error states

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not persisting**: Check Supabase URL and keys
2. **AI not working**: Verify OpenAI API key or use demo mode
3. **Database errors**: Ensure migration was run successfully
4. **Build errors**: Check all environment variables are set

### Debug Mode

Set `VITE_APP_ENV=development` for detailed error logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review Supabase and OpenAI documentation
- Create an issue in the repository

---

Built with ❤️ using React, Supabase, and OpenAI
