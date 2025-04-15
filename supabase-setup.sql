-- Run this SQL in your Supabase SQL editor to create the waitlist table

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);

-- Add RLS (Row Level Security) policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view the waitlist
CREATE POLICY "Allow authenticated users to view waitlist" 
  ON waitlist FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow anyone to insert into the waitlist (for the signup form)
CREATE POLICY "Allow anyone to insert into waitlist" 
  ON waitlist FOR INSERT 
  WITH CHECK (true);

-- Only allow authenticated users to update or delete from the waitlist
CREATE POLICY "Allow authenticated users to update waitlist" 
  ON waitlist FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete from waitlist" 
  ON waitlist FOR DELETE 
  USING (auth.role() = 'authenticated');
