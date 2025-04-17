-- Create schema for Speasy app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create newsletter categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions to categories
CREATE TABLE IF NOT EXISTS user_category_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Create content sources table (newsletters, websites, etc.)
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content items table
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

-- Create user saved content items
CREATE TABLE IF NOT EXISTS user_content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create audio files table
CREATE TABLE IF NOT EXISTS audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration INTEGER, -- in seconds
  format TEXT,
  type TEXT, -- 'summary', 'full', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user submitted URLs table
CREATE TABLE IF NOT EXISTS user_submitted_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  content_item_id UUID REFERENCES content_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create podcast feeds table
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

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Create content item tags
CREATE TABLE IF NOT EXISTS content_item_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, tag_id)
);

-- Create RLS policies

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

-- User category subscriptions: Users can manage their own subscriptions
ALTER TABLE user_category_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON user_category_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_category_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_category_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON user_category_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Content sources: Anyone can view sources
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content sources are viewable by everyone" ON content_sources
  FOR SELECT USING (true);

-- Content items: Anyone can view content items
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content items are viewable by everyone" ON content_items
  FOR SELECT USING (true);

-- User content items: Users can manage their own saved content
ALTER TABLE user_content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved content" ON user_content_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved content" ON user_content_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved content" ON user_content_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved content" ON user_content_items
  FOR DELETE USING (auth.uid() = user_id);

-- Audio files: Anyone can view audio files
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audio files are viewable by everyone" ON audio_files
  FOR SELECT USING (true);

-- User submitted URLs: Users can manage their own submitted URLs
ALTER TABLE user_submitted_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submitted URLs" ON user_submitted_urls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submitted URLs" ON user_submitted_urls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submitted URLs" ON user_submitted_urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submitted URLs" ON user_submitted_urls
  FOR DELETE USING (auth.uid() = user_id);

-- Podcast feeds: Users can manage their own podcast feeds
ALTER TABLE podcast_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own podcast feeds" ON podcast_feeds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own podcast feeds" ON podcast_feeds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast feeds" ON podcast_feeds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcast feeds" ON podcast_feeds
  FOR DELETE USING (auth.uid() = user_id);

-- Tags: Anyone can view tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

-- Content item tags: Anyone can view content item tags
ALTER TABLE content_item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content item tags are viewable by everyone" ON content_item_tags
  FOR SELECT USING (true);

-- Create function to handle new user signup
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

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Technology', 'technology', 'Latest tech news and insights', 'https://images.unsplash.com/photo-1518770660439-4636190af475'),
('Business', 'business', 'Business strategy and market trends', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf'),
('Design', 'design', 'UX/UI and product design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5'),
('Productivity', 'productivity', 'Work smarter and achieve more', 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b'),
('Science', 'science', 'Scientific discoveries and research', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d');

-- Insert sample content sources
INSERT INTO content_sources (name, url, feed_url, category_id) VALUES
('TLDR Newsletter', 'https://tldr.tech', 'https://tldr.tech/feed.xml', (SELECT id FROM categories WHERE slug = 'technology')),
('Lenny''s Newsletter', 'https://www.lennysnewsletter.com', 'https://www.lennysnewsletter.com/feed', (SELECT id FROM categories WHERE slug = 'business')),
('Dense Discovery', 'https://www.densediscovery.com', 'https://www.densediscovery.com/feed', (SELECT id FROM categories WHERE slug = 'design')),
('Superorganizers', 'https://superorganizers.substack.com', 'https://superorganizers.substack.com/feed', (SELECT id FROM categories WHERE slug = 'productivity')),
('Quanta Magazine', 'https://www.quantamagazine.org', 'https://www.quantamagazine.org/feed', (SELECT id FROM categories WHERE slug = 'science'));
