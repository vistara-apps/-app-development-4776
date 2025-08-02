# TryOn.ai - Virtual Wardrobe Management & AI-Powered Virtual Try-On

A modern React application that combines virtual wardrobe management with AI-powered virtual try-on functionality and social sharing features.

## Features

### Virtual Try-On
- **AI-Powered Analysis**: Upload your photo and try on clothing virtually using OpenAI's vision models
- **Realistic Feedback**: Get detailed analysis on fit, style, and color coordination
- **Multiple Product Categories**: Support for tops, bottoms, dresses, and accessories
- **Subscription-Based Access**: Premium features require active subscription

### Virtual Wardrobe Management
- **Digital Closet**: Organize and manage your clothing items digitally
- **Style Recommendations**: AI-powered suggestions based on your preferences
- **Outfit Planning**: Plan and save outfit combinations
- **Wardrobe Analytics**: Track usage and optimize your clothing choices

### Social Sharing
- **Multi-Platform Sharing**: Share your virtual try-on results and outfits
- **Social Modal**: Integrated sharing interface for various platforms
- **Privacy Controls**: Control what you share and with whom

### Authentication & User Management
- **Supabase Authentication**: Secure user registration and login
- **User Profiles**: Manage personal information and preferences
- **Body Measurements**: Store measurements for better fit analysis
- **Subscription Management**: Handle different plan tiers and features

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Animation**: Framer Motion
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4 Vision
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tryon-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Service Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_AI_API_URL=your_ai_api_url
   VITE_AI_API_KEY=your_ai_api_key
   
   # Application Configuration
   VITE_APP_URL=http://localhost:5173
   VITE_APP_ENV=development
   ```

4. **Supabase Setup**
   
   Create the following tables in your Supabase database:
   
   ```sql
   -- Profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT,
     full_name TEXT,
     avatar_url TEXT,
     body_measurements JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Subscriptions table
   CREATE TABLE subscriptions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users,
     plan TEXT NOT NULL,
     active BOOLEAN DEFAULT true,
     expires_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Wardrobe items table
   CREATE TABLE wardrobe_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users,
     name TEXT NOT NULL,
     category TEXT,
     color TEXT,
     brand TEXT,
     image_url TEXT,
     metadata JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Try-on sessions table
   CREATE TABLE try_on_sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users,
     product_data JSONB,
     result_data JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ErrorBoundary.jsx      # Global error boundary
│   ├── LoadingSpinner.jsx     # Loading indicators
│   ├── Navbar.jsx             # Navigation component
│   ├── ProtectedRoute.jsx     # Route protection
│   ├── SocialShareModal.jsx   # Social sharing
│   └── VirtualResult.jsx      # Try-on results display
├── hooks/               # Custom React hooks
│   ├── useAuth.js              # Authentication hook
│   └── useSocialShare.js       # Social sharing hook
├── lib/                 # Core utilities
│   └── supabase.js             # Supabase client setup
├── pages/               # Page components
│   ├── Home.jsx                # Landing page
│   ├── Login.jsx               # Authentication pages
│   ├── Register.jsx
│   ├── Profile.jsx             # User profile
│   ├── VirtualTryOn.jsx        # Try-on interface
│   ├── Wardrobe.jsx            # Wardrobe management
│   ├── Recommendations.jsx     # AI recommendations
│   └── Pricing.jsx             # Subscription plans
├── services/            # External service integrations
│   ├── aiService.js            # OpenAI integration
│   ├── userService.js          # User data management
│   └── subscriptionService.js  # Subscription handling
├── store/               # State management
│   └── authStore.js            # Authentication state
├── utils/               # Utility functions
│   ├── aiApi.js                # AI API helpers
│   ├── errorHandling.js        # Error management
│   └── socialSharing.js        # Social sharing utilities
├── config/              # Configuration files
│   └── env.js                  # Environment validation
├── App.jsx              # Main application component
└── main.jsx             # Application entry point
```

## Key Features Implementation

### Authentication Flow
- Automatic session management with Supabase
- Protected routes with subscription checking
- Profile management with body measurements
- Password reset functionality

### Virtual Try-On Process
1. **Photo Upload**: Users upload their photo with size validation
2. **Product Selection**: Choose from available clothing items
3. **AI Processing**: Generate virtual try-on using OpenAI's vision models
4. **Results Display**: Show realistic try-on with fit analysis and recommendations

### Wardrobe Management
- Digital inventory of clothing items
- Category-based organization
- Style preference tracking
- Outfit combination suggestions

### Social Sharing
- Multi-platform sharing support
- Privacy-controlled sharing options
- Integrated sharing modals
- Social media optimization

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI features | Optional* |
| `VITE_AI_API_URL` | Custom AI API endpoint | Optional |
| `VITE_AI_API_KEY` | Custom AI API key | Optional |
| `VITE_APP_URL` | Application base URL | Yes |
| `VITE_APP_ENV` | Environment (development/production) | Yes |

*\* If not provided, AI features will use mock data*

## API Integration

### OpenAI Integration
- Uses GPT-4 Vision for virtual try-on analysis
- Provides detailed feedback on fit, style, and color
- Generates personalized recommendations
- Fallback to mock data when API is unavailable

### Supabase Integration
- Real-time authentication
- User profile management
- Subscription handling
- Data persistence for wardrobe and try-on sessions

## Production Deployment

### Security Considerations
- API keys should be stored securely (not in frontend in production)
- Implement proper CORS settings
- Use environment-specific configurations
- Enable RLS (Row Level Security) in Supabase

### Performance Optimization
- Image compression for virtual try-on
- Lazy loading of components
- Efficient state management
- CDN for static assets

### Error Handling
- Comprehensive error boundaries
- Graceful fallbacks for AI services
- User-friendly error messages
- Retry mechanisms for network issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## Roadmap

- [ ] Mobile app development
- [ ] Advanced AI styling recommendations
- [ ] Social networking features
- [ ] Marketplace integration
- [ ] AR/VR virtual try-on capabilities
- [ ] Integration with popular fashion brands