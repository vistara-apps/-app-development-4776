# TryOn.ai - Virtual Try-On Application

A modern React application with AI-powered virtual try-on functionality, built with Supabase authentication and real-time AI integration.

## Features

- 🔐 **Secure Authentication** - Powered by Supabase with email/password and social login support
- 🤖 **AI Virtual Try-On** - Advanced AI integration for realistic virtual clothing try-on
- 👤 **User Profiles** - Personalized user profiles with style preferences and body measurements
- 💳 **Subscription Management** - Tiered subscription system with different feature access
- 📱 **Responsive Design** - Modern, mobile-first design with smooth animations
- 🔄 **Real-time Updates** - Live session management and state synchronization

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API / Custom AI endpoints
- **Routing**: React Router DOM
- **UI Components**: Headless UI, Heroicons

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- AI API key (OpenAI or custom AI service)

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
   
   Copy the `.env` file and update with your credentials:
   ```bash
   cp .env .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI API Configuration
   VITE_AI_API_KEY=your_ai_api_key
   VITE_AI_API_ENDPOINT=https://api.openai.com/v1
   
   # Optional: Custom AI service
   VITE_CUSTOM_AI_ENDPOINT=your_custom_ai_endpoint
   ```

4. **Database Setup**
   
   Run the migration in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_create_user_profiles.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Supabase Configuration

### Required Tables

The application requires the following database tables (created by the migration):

- `profiles` - User profile information
- `subscriptions` - User subscription status
- `tryon_history` - Virtual try-on history

### Authentication Setup

1. Enable email authentication in your Supabase project
2. Configure email templates (optional)
3. Set up OAuth providers if needed (Google, Facebook, etc.)

### Row Level Security (RLS)

The migration automatically sets up RLS policies to ensure users can only access their own data.

## AI Integration

### Supported AI Services

1. **OpenAI DALL-E** - For image generation
2. **Custom AI Endpoints** - For specialized virtual try-on models

### Configuration

Set the appropriate environment variables based on your AI service:

- For OpenAI: Set `VITE_AI_API_KEY` and use default `VITE_AI_API_ENDPOINT`
- For custom services: Set `VITE_CUSTOM_AI_ENDPOINT` and `VITE_AI_API_KEY`

## Usage

### Authentication Flow

1. Users can register with email/password
2. Email verification is handled by Supabase
3. Sessions persist across browser restarts
4. Automatic token refresh

### Virtual Try-On Process

1. **Upload Photo** - Users upload a clear photo of themselves
2. **Select Product** - Choose from available clothing items
3. **AI Generation** - AI processes the images and generates try-on result
4. **View Results** - See the virtual try-on with confidence scores and feedback

### Subscription System

- **Free Tier** - Limited try-on attempts
- **Paid Tiers** - Unlimited access with premium features

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # Zustand stores
├── lib/                # Utility libraries
│   ├── supabase.js     # Supabase client configuration
│   └── aiApi.js        # AI API integration
└── styles/             # CSS and styling
```

### Key Components

- `useAuthStore` - Authentication state management
- `VirtualTryOn` - Main try-on interface
- `Navbar` - Navigation with auth status
- `ProductSelector` - Product selection interface

### API Integration

The AI API integration supports:
- Multiple AI service providers
- Fallback handling for failed requests
- Progress tracking and user feedback
- Error recovery and retry logic

## Deployment

### Environment Variables

Ensure all environment variables are set in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_API_KEY=your_ai_api_key
VITE_AI_API_ENDPOINT=your_ai_endpoint
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Troubleshooting

### Common Issues

1. **Authentication not persisting**
   - Check Supabase URL and anon key
   - Verify RLS policies are set up correctly

2. **AI generation failing**
   - Verify AI API key and endpoint
   - Check network connectivity
   - Review API rate limits

3. **Database errors**
   - Ensure migration has been run
   - Check RLS policies
   - Verify user permissions

### Debug Mode

Enable debug logging by adding to your environment:
```env
VITE_DEBUG=true
```

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
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

Built with ❤️ using React, Supabase, and AI technology.

