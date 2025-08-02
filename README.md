# TryOn.ai - Virtual Try-On Application

A modern React-based virtual try-on application powered by AI, featuring Supabase authentication and social sharing capabilities.

## 🚀 Features

### ✨ Virtual Try-On
- AI-powered virtual clothing try-on
- Real-time photo processing
- Confidence scoring and fit analysis
- Style recommendations

### 🔐 Authentication
- Supabase authentication integration
- Email/password registration and login
- Session persistence
- Protected routes with subscription requirements

### 📱 Social Sharing
- Multi-platform sharing (Facebook, Twitter, Instagram, LinkedIn, WhatsApp, Pinterest)
- Native Web Share API support for mobile devices
- Custom sharing content generation
- Clipboard fallback for unsupported platforms

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Loading states and error handling

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Authentication**: Supabase Auth
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- AI API credentials (optional, falls back to mock mode)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd tryon-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Configuration (Optional)
VITE_AI_API_URL=your_ai_api_url
VITE_AI_API_KEY=your_ai_api_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
```

### 4. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Enable Email authentication in Authentication > Settings
4. (Optional) Set up additional OAuth providers

### 5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── SocialShareModal.jsx
│   └── VirtualResult.jsx
├── config/             # Configuration files
│   └── env.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   └── useSocialShare.js
├── lib/                # External library configurations
│   └── supabase.js
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── VirtualTryOn.jsx
├── store/              # State management
│   ├── authStore.js
│   └── tryOnStore.js
└── utils/              # Utility functions
    ├── aiApi.js
    ├── errorHandling.js
    └── socialSharing.js
```

## 🔧 Configuration

### Authentication
The app uses Supabase for authentication. Users can:
- Register with email/password
- Sign in with existing credentials
- Access protected routes based on authentication status
- Maintain sessions across browser refreshes

### AI Integration
The virtual try-on feature supports:
- Real AI API integration (when configured)
- Mock mode fallback for development
- Error handling and retry logic
- Processing time tracking

### Social Sharing
Supported platforms:
- **Facebook**: Direct sharing via Facebook API
- **Twitter**: Tweet with image and hashtags
- **Instagram**: Copy to clipboard (no direct API)
- **LinkedIn**: Professional network sharing
- **WhatsApp**: Mobile messaging
- **Pinterest**: Pin with image and description

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Environment Variables for Production
Ensure all required environment variables are set in your production environment:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_APP_URL`: Your production domain
- `VITE_AI_API_URL`: AI service endpoint (optional)
- `VITE_AI_API_KEY`: AI service API key (optional)

## 🔒 Security Considerations

- Environment variables are properly prefixed with `VITE_` for client-side access
- Supabase handles authentication security and session management
- API keys are validated before use
- Error messages don't expose sensitive information
- Protected routes prevent unauthorized access

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Supabase URL and anon key in `.env.local`
   - Verify email authentication is enabled in Supabase dashboard
   - Clear browser storage and try again

2. **Virtual try-on fails**
   - Check AI API credentials (or use mock mode)
   - Ensure images are under 5MB
   - Check browser console for detailed error messages

3. **Social sharing not working**
   - Check if popups are blocked in browser
   - Verify the sharing URL is accessible
   - Try different platforms or use clipboard fallback

### Development Mode
- Error boundary shows detailed error information
- Console logs provide debugging information
- Mock AI API is used when real API is not configured

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Check the troubleshooting section above
- Review the Supabase documentation
- Open an issue in the repository

