# Speasy Database Schema

This document outlines the database schema used in the Speasy application.

## Overview

Speasy uses Supabase PostgreSQL database for storing user data, content information, and application state. The database schema is designed to support the core functionality of transforming newsletters and articles into podcast-style audio content.

## Tables

### Users

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  stripe_customer_id TEXT,
  subscription_status TEXT,
  subscription_end_date TIMESTAMP WITH TIME ZONE
);
```

The `users` table stores basic user information and subscription status:
- `id`: Unique user identifier (UUID)
- `email`: User's email address (unique)
- `created_at`: When the user record was created
- `updated_at`: When the user record was last updated
- `stripe_customer_id`: Reference to the user's Stripe customer ID
- `subscription_status`: Current subscription status (active, canceled, etc.)
- `subscription_end_date`: When the subscription will end (if applicable)

### Profiles

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

The `profiles` table extends user information:
- `id`: References auth.users (UUID)
- `email`: User's email address (unique)
- `full_name`: User's full name
- `avatar_url`: URL to the user's avatar image
- `created_at`: When the profile was created
- `updated_at`: When the profile was last updated

### Categories

```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The `categories` table defines content categories:
- `id`: Unique category identifier (UUID)
- `name`: Category name
- `slug`: URL-friendly category identifier (unique)
- `description`: Category description
- `image_url`: URL to the category image
- `created_at`: When the category was created

### User Category Subscriptions

```sql
CREATE TABLE IF NOT EXISTS user_category_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);
```

The `user_category_subscriptions` table tracks which categories users are subscribed to:
- `id`: Unique subscription identifier (UUID)
- `user_id`: References profiles(id)
- `category_id`: References categories(id)
- `created_at`: When the subscription was created

### Content Sources

```sql
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The `content_sources` table tracks sources of content:
- `id`: Unique source identifier (UUID)
- `name`: Source name
- `url`: Source website URL
- `feed_url`: RSS feed URL (if applicable)
- `category_id`: References categories(id)
- `created_at`: When the source was created

### Content Items

```sql
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_id UUID REFERENCES content_sources(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(url)
);
```

The `content_items` table stores individual content pieces:
- `id`: Unique content identifier (UUID)
- `title`: Content title
- `url`: Original content URL
- `content`: Full content text
- `summary`: Content summary
- `source_id`: References content_sources(id)
- `published_at`: When the content was published
- `created_at`: When the content was added to Speasy

### User Content Items

```sql
CREATE TABLE IF NOT EXISTS user_content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);
```

The `user_content_items` table tracks user interactions with content:
- `id`: Unique identifier (UUID)
- `user_id`: References profiles(id)
- `content_id`: References content_items(id)
- `is_read`: Whether the user has read/listened to the content
- `is_favorite`: Whether the user has favorited the content
- `created_at`: When the record was created

### Audio Files

```sql
CREATE TABLE IF NOT EXISTS audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration INTEGER, -- in seconds
  format TEXT,
  type TEXT, -- 'summary', 'full', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The `audio_files` table stores information about audio versions of content:
- `id`: Unique audio file identifier (UUID)
- `content_id`: References content_items(id)
- `file_url`: URL to the audio file
- `duration`: Audio duration in seconds
- `format`: Audio file format
- `type`: Audio content type (summary, full, etc.)
- `created_at`: When the audio file was created

### User Submitted URLs

```sql
CREATE TABLE IF NOT EXISTS user_submitted_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  content_item_id UUID REFERENCES content_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The `user_submitted_urls` table tracks URLs submitted by users for processing:
- `id`: Unique identifier (UUID)
- `user_id`: References profiles(id)
- `url`: The submitted URL
- `title`: Optional title provided by the user
- `status`: Processing status
- `content_item_id`: Reference to the created content item (if any)
- `created_at`: When the URL was submitted

### Podcast Feeds

```sql
CREATE TABLE IF NOT EXISTS podcast_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  feed_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feed_url)
);
```

The `podcast_feeds` table manages user podcast feeds:
- `id`: Unique feed identifier (UUID)
- `user_id`: References profiles(id)
- `title`: Feed title
- `description`: Feed description
- `feed_url`: Feed URL
- `is_default`: Whether this is the user's default feed
- `created_at`: When the feed was created

## Row Level Security (RLS)

Speasy uses Supabase Row Level Security policies to control access to data:

```sql
-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories: Anyone can view categories, only admins can modify
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);
```

Each table has specific RLS policies defining who can view, insert, update, or delete records.

## Database Triggers

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Create default podcast feed for new user
  INSERT INTO public.podcast_feeds (user_id, title, description, feed_url, is_default)
  VALUES (
    new.id, 
    'My Speasy Feed', 
    'Your personalized audio content feed', 
    concat('https://speasy.app/api/feeds/', new.id, '/default'),
    true
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

The database uses triggers to automate certain operations:
- `handle_new_user()`: Creates a profile and default podcast feed when a new user signs up

## Sample Data

```sql
INSERT INTO categories (name, slug, description, image_url) VALUES
('Technology', 'technology', 'Latest tech news and insights', 'https://images.unsplash.com/photo-1518770660439-4636190af475'),
('Business', 'business', 'Business strategy and market trends', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf'),
('Design', 'design', 'UX/UI and product design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5'),
('Productivity', 'productivity', 'Work smarter and achieve more', 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b'),
('Science', 'science', 'Scientific discoveries and research', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d');
```

The schema includes sample data for categories and content sources to provide a starting point for new installations.
