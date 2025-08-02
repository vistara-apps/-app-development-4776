# Supabase Setup Instructions

This guide will help you set up Supabase authentication and database for the Virtual Try-On application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- An OpenAI account with API access (sign up at https://platform.openai.com)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "virtual-tryon-app")
5. Enter a database password (save this securely)
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key

## Step 3: Set Up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_create_users_table.sql`
3. Click "Run" to execute the migration
4. This will create the profiles table and set up Row Level Security

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to register a new account
3. Check your Supabase dashboard > Authentication > Users to see if the user was created
4. Check the profiles table to see if a profile was automatically created

## Features Implemented

### Authentication
- ✅ User registration with email verification
- ✅ User login/logout
- ✅ Session persistence
- ✅ Protected routes
- ✅ Profile management

### Database
- ✅ User profiles with body measurements
- ✅ Style preferences storage
- ✅ Subscription management
- ✅ Row Level Security policies

### AI Integration
- ✅ OpenAI GPT-4 Vision for styling recommendations
- ✅ Virtual try-on analysis
- ✅ Body type assessment
- ✅ Color and style matching

### Security
- ✅ Environment variable protection
- ✅ Row Level Security in database
- ✅ API key validation
- ✅ Error handling and user feedback

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Make sure your OpenAI API key is correct
   - Check that you have sufficient credits in your OpenAI account

2. **"Failed to create user" error**
   - Check your Supabase URL and anon key
   - Make sure the database migration was run successfully

3. **"Authentication failed" error**
   - Check your Supabase project settings
   - Make sure email confirmation is configured properly

### Database Issues

If you need to reset the database:

1. Go to Supabase dashboard > SQL Editor
2. Run: `DROP TABLE IF EXISTS public.profiles CASCADE;`
3. Re-run the migration from `supabase/migrations/001_create_users_table.sql`

### Email Configuration

For production, you'll want to configure email templates:

1. Go to Supabase dashboard > Authentication > Email Templates
2. Customize the confirmation and reset password emails
3. Set up a custom SMTP provider if needed

## Production Considerations

### Security
- Move API keys to server-side environment
- Implement proper API rate limiting
- Add input validation and sanitization
- Use HTTPS in production

### Performance
- Implement image compression for uploads
- Add caching for AI responses
- Optimize database queries
- Use CDN for static assets

### Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor API usage and costs
- Track user engagement metrics
- Set up database backups

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check the Supabase logs in your dashboard
3. Verify all environment variables are set correctly
4. Make sure your OpenAI account has sufficient credits

