# Database Schema for Virtual Wardrobe App

This document outlines the required database schema for the Virtual Wardrobe application using Supabase.

## Required Tables

### 1. profiles
Extends the default Supabase auth.users table with additional user information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  body_measurements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. subscriptions
Manages user subscription information.

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3. wardrobe_items
Stores user's clothing items in their virtual wardrobe.

```sql
CREATE TABLE wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  size TEXT,
  price DECIMAL(10,2),
  description TEXT,
  image_url TEXT,
  seasons TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own wardrobe items" ON wardrobe_items
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX idx_wardrobe_items_deleted ON wardrobe_items(deleted);
```

### 4. try_on_sessions
Stores virtual try-on session data and results.

```sql
CREATE TABLE try_on_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_photo_url TEXT NOT NULL,
  product_data JSONB NOT NULL,
  result_data JSONB,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE try_on_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own try-on sessions" ON try_on_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_try_on_sessions_user_id ON try_on_sessions(user_id);
CREATE INDEX idx_try_on_sessions_created_at ON try_on_sessions(created_at);
```

## Storage Buckets

### 1. avatars
For user profile pictures.

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. wardrobe-images
For wardrobe item photos.

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe-images', 'wardrobe-images', true);

-- Policies
CREATE POLICY "Wardrobe images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'wardrobe-images');

CREATE POLICY "Users can upload wardrobe images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their wardrobe images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their wardrobe images" ON storage.objects
  FOR DELETE USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Functions and Triggers

### Auto-update timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wardrobe_items_updated_at BEFORE UPDATE ON wardrobe_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create profile on signup

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, plan, active, expires_at)
  VALUES (
    NEW.id,
    'free',
    true,
    NOW() + INTERVAL '1 year'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Setup Instructions

1. **Create a new Supabase project** at https://supabase.com

2. **Run the SQL commands** above in the Supabase SQL editor in the following order:
   - Tables (profiles, subscriptions, wardrobe_items, try_on_sessions)
   - Storage buckets and policies
   - Functions and triggers

3. **Configure authentication providers** in the Supabase dashboard:
   - Enable email/password authentication
   - Optionally enable social providers (Google, Facebook, etc.)

4. **Get your project credentials**:
   - Project URL: Found in Settings > API
   - Anon key: Found in Settings > API

5. **Update your .env file** with the credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Data Types Reference

### body_measurements JSONB structure:
```json
{
  "chest": 36,
  "waist": 30,
  "hips": 38,
  "height": 68,
  "weight": 150,
  "units": "imperial"
}
```

### product_data JSONB structure:
```json
{
  "name": "Blue Denim Jacket",
  "brand": "Levi's",
  "category": "Outerwear",
  "color": "Blue",
  "size": "M",
  "price": 89.99,
  "image": "https://example.com/image.jpg"
}
```

### result_data JSONB structure:
```json
{
  "image": "https://generated-image-url.jpg",
  "confidence": 0.85,
  "feedback": {
    "fit": "Great fit!",
    "style": "This style suits you well",
    "color": "This color complements your skin tone",
    "recommendations": ["Try a smaller size for a more fitted look"]
  },
  "overall_rating": 4.5
}
```

