-- Create the blog_posts table for release notes
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  author TEXT DEFAULT 'Speasy Team',
  category TEXT DEFAULT 'Release Notes',
  image_url TEXT
);

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published blog posts
CREATE POLICY "Allow anyone to read published blog posts" 
  ON blog_posts FOR SELECT 
  USING (is_published = true);

-- Only allow authenticated users to insert, update, or delete blog posts
CREATE POLICY "Allow authenticated users to insert blog posts" 
  ON blog_posts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update blog posts" 
  ON blog_posts FOR UPDATE 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete blog posts" 
  ON blog_posts FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Insert some sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, published_at, category)
VALUES 
  (
    'Introducing Speasy Beta', 
    'introducing-speasy-beta', 
    '## Introducing Speasy Beta

We're excited to announce the beta release of Speasy, your audio newsletter companion!

### What's included in this release:

- **Curated Newsletter Selection**: We've partnered with 10 top newsletters across tech, business, and design
- **Private Podcast Feed**: Listen to summaries in your favorite podcast app
- **High-Quality Audio**: Natural-sounding voices that make listening a pleasure

### Coming soon:

- Personal inbox integration
- Custom filters and categories
- Daily briefing format

We're looking forward to your feedback as we continue to improve Speasy!',
    'We're excited to announce the beta release of Speasy, your audio newsletter companion!',
    '2023-11-01T12:00:00Z',
    'Release Notes'
  ),
  (
    'New Feature: Improved Audio Quality', 
    'improved-audio-quality', 
    '## New Feature: Improved Audio Quality

We've made significant improvements to our audio generation system:

### What's new:

- **Enhanced Voice Models**: More natural intonation and emphasis
- **Adaptive Pacing**: Better handling of complex content
- **Improved Pronunciation**: Better handling of technical terms and names

These improvements make the listening experience even more enjoyable and help you absorb information more effectively.

Let us know what you think of the new audio quality!',
    'We've made significant improvements to our audio generation system with enhanced voice models and better pronunciation.',
    '2023-11-15T12:00:00Z',
    'Release Notes'
  ),
  (
    'Coming Soon: Personal Inbox Integration', 
    'coming-soon-personal-inbox', 
    '## Coming Soon: Personal Inbox Integration

We're putting the finishing touches on our most requested feature: personal inbox integration!

### What to expect:

- **Connect Gmail or Outlook**: Securely link your email account
- **Smart Filtering**: We'll identify newsletters and important updates
- **Customizable Rules**: Choose which emails get summarized
- **Privacy First**: Your data remains secure and private

This feature will be available to Pro subscribers in the next two weeks. Stay tuned for the announcement!',
    'We're putting the finishing touches on our most requested feature: personal inbox integration!',
    '2023-12-01T12:00:00Z',
    'Announcements'
  );
