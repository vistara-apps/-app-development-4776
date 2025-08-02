# Virtual Wardrobe & Try-On AI

A modern React application that allows users to manage their virtual wardrobe and use AI-powered virtual try-on functionality.

## Features

### 🎯 Core Features
- **Virtual Wardrobe Management**: Catalog, organize, and manage clothing items
- **AI-Powered Virtual Try-On**: See how clothes look on you using advanced AI
- **Smart Recommendations**: Get personalized style suggestions
- **User Authentication**: Secure login with Supabase Auth
- **Subscription Management**: Tiered access to premium features

### 👗 Wardrobe Features
- Add items with photos, categories, colors, sizes, and brands
- Filter and search your wardrobe
- Mark favorite items
- View wardrobe statistics and insights
- Organize by seasons and occasions

### 🤖 AI Features
- Virtual try-on with confidence scoring
- Style compatibility analysis
- Color matching recommendations
- Fit assessment and suggestions
- Wardrobe gap analysis

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Integration**: OpenAI GPT-4 Vision
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (for AI features)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd virtual-wardrobe-app
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# App Configuration
VITE_APP_ENV=development
```

### 3. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Set up the database schema** by running the SQL commands in `DATABASE_SCHEMA.md`

3. **Configure authentication**:
   - Go to Authentication > Settings
   - Enable email/password authentication
   - Optionally enable social providers

4. **Set up storage buckets**:
   - The SQL schema will create the necessary buckets
   - Ensure public access is configured correctly

5. **Get your credentials**:
   - Go to Settings > API
   - Copy your Project URL and anon/public key

### 4. OpenAI Setup

1. **Get an API key** from [OpenAI](https://platform.openai.com/api-keys)
2. **Add credits** to your OpenAI account
3. **Add the key** to your `.env` file

### 5. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddItemModal.jsx
│   ├── ErrorBoundary.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── WardrobeGrid.jsx
│   ├── WardrobeItem.jsx
│   ├── WardrobeStats.jsx
│   └── WardrobeFilters.jsx
├── hooks/               # Custom React hooks
│   └── useAuth.js
├── lib/                 # Library configurations
│   └── supabase.js
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── VirtualTryOn.jsx
│   ├── Wardrobe.jsx
│   ├── Profile.jsx
│   ├── Recommendations.jsx
│   └── Pricing.jsx
├── services/            # API and service layers
│   ├── aiService.js
│   ├── subscriptionService.js
│   ├── userService.js
│   └── wardrobeService.js
├── store/               # Zustand state management
│   ├── authStore.js
│   ├── tryOnStore.js
│   └── wardrobeStore.js
├── App.jsx              # Main app component
└── main.jsx             # App entry point
```

## Key Features Implementation

### Authentication Flow
- Persistent sessions with automatic token refresh
- Protected routes for authenticated features
- User profile management with Supabase

### Virtual Wardrobe
- CRUD operations for wardrobe items
- Image upload and storage
- Advanced filtering and search
- Statistics and analytics

### AI Integration
- OpenAI GPT-4 Vision for virtual try-on analysis
- Fallback handling for API failures
- Image processing and optimization
- Confidence scoring and recommendations

### State Management
- Zustand stores for different app domains
- Optimistic updates for better UX
- Error handling and loading states

## Subscription Tiers

### Free Tier
- 3 virtual try-ons per month
- Up to 10 wardrobe items
- Basic features

### Basic Tier
- 50 virtual try-ons per month
- Up to 100 wardrobe items
- AI recommendations

### Premium Tier
- Unlimited virtual try-ons
- Unlimited wardrobe items
- Advanced AI features
- Premium support

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any static hosting service:
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript-style JSDoc comments
- Implement proper error boundaries

### State Management
- Use Zustand for global state
- Keep component state local when possible
- Implement optimistic updates for better UX

### API Integration
- Always handle loading and error states
- Implement proper fallbacks for AI services
- Use proper TypeScript types for API responses

## Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify your environment variables
   - Check Supabase project status
   - Ensure RLS policies are correctly set

2. **AI Service Failures**
   - Check OpenAI API key and credits
   - Verify image format and size limits
   - Review API rate limits

3. **Image Upload Issues**
   - Check Supabase storage bucket policies
   - Verify file size limits (5MB max)
   - Ensure proper CORS configuration

### Debug Mode
Set `VITE_APP_ENV=development` to enable:
- Detailed error logging
- Development-only features
- Debug information in console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the database schema documentation
- Open an issue on GitHub

