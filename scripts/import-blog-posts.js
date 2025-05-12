#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to blog markdown files
const BLOG_DIR = path.join(__dirname, '../blog');

// Function to extract frontmatter and content from markdown files
function parseBlogPost(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse the markdown file
    const lines = content.split('\n');
    const titleLine = lines[0].replace('# ', '');
    
    // Find the table section
    const tableStartIndex = content.indexOf('| id');
    const tableSeparatorIndex = content.indexOf('| ----', tableStartIndex);
    const tableDataIndex = content.indexOf('|', tableSeparatorIndex + 5);
    
    if (tableStartIndex === -1 || tableSeparatorIndex === -1 || tableDataIndex === -1) {
      throw new Error('Could not find proper table structure in the markdown file.');
    }
    
    // Get the data row
    const dataLineEnd = content.indexOf('\n', tableDataIndex);
    const dataLine = content.substring(tableDataIndex, dataLineEnd);
    const cells = dataLine.split('|').map(cell => cell.trim()).filter(Boolean);
    
    // Find where the content ends and excerpt begins by looking for the last pipe
    const fullContent = content.substring(dataLineEnd + 1);
    const lastPipeIndex = fullContent.lastIndexOf('|');
    
    let extractedContent = fullContent;
    let excerpt = '';
    
    if (lastPipeIndex !== -1) {
      extractedContent = fullContent.substring(0, lastPipeIndex);
      excerpt = fullContent.substring(lastPipeIndex + 1).trim();
    }
    
    // Get the filename without extension for slug
    const fileName = path.basename(filePath, '.md');
    
    // Extract values from cells if possible, but don't use the ID value from the file
    // Let Supabase generate a new UUID instead to avoid formatting issues
    const title = cells.length > 1 ? cells[1] : titleLine;
    const slug = cells.length > 2 ? cells[2] : fileName;
    
    return {
      // Don't include ID to let Supabase generate a new one
      title: title || titleLine,
      slug: slug || fileName,
      content: extractedContent.trim(),
      excerpt: excerpt || `${title} - Speasy blog post`,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_published: true,
      author: 'Speasy Team',
      category: 'Guides'
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

// Function to import blog posts to Supabase
async function importBlogPosts() {
  try {
    // Read all markdown files from the blog directory
    const files = fs.readdirSync(BLOG_DIR)
      .filter(file => file.endsWith('.md'));
    
    console.log(`Found ${files.length} blog post files.`);
    
    // Check if blog_posts table exists, create it if not
    const { error: tableCheckError } = await supabase.from('blog_posts').select('id').limit(1);
    
    if (tableCheckError && tableCheckError.code === '42P01') { // table doesn't exist
      console.log('Creating blog_posts table...');
      
      // Execute the SQL directly
      const { error: createTableError } = await supabase.rpc('exec_sql', { 
        sql: `
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
          category TEXT DEFAULT 'Guides',
          image_url TEXT
        );
        
        CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
        CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts (published_at);
        
        ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow anyone to read published blog posts" 
          ON blog_posts FOR SELECT 
          USING (is_published = true);
        `
      });
      
      if (createTableError) {
        console.error('Error creating table:', createTableError);
        return;
      }
      
      console.log('Created blog_posts table.');
    }
    
    // Process each file and insert into Supabase
    for (const file of files) {
      const filePath = path.join(BLOG_DIR, file);
      const blogPost = parseBlogPost(filePath);
      
      if (!blogPost) {
        console.error(`Failed to parse ${file}. Skipping.`);
        continue;
      }
      
      console.log(`Processing ${blogPost.title} (${blogPost.slug})...`);
      
      // Check if blog post with this slug already exists
      const { data: existingPost, error: checkError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', blogPost.slug)
        .limit(1);
      
      if (checkError) {
        console.error(`Error checking for existing post ${blogPost.slug}:`, checkError);
        continue;
      }
      
      if (existingPost && existingPost.length > 0) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            title: blogPost.title,
            content: blogPost.content,
            excerpt: blogPost.excerpt,
            updated_at: new Date().toISOString(),
            category: blogPost.category,
            author: blogPost.author
          })
          .eq('slug', blogPost.slug);
        
        if (updateError) {
          console.error(`Error updating ${blogPost.slug}:`, updateError);
        } else {
          console.log(`Updated: ${blogPost.title} (${blogPost.slug})`);
        }
      } else {
        // Insert new post
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([blogPost]);
        
        if (insertError) {
          console.error(`Error inserting ${blogPost.slug}:`, insertError);
        } else {
          console.log(`Inserted: ${blogPost.title} (${blogPost.slug})`);
        }
      }
    }
    
    console.log('Import completed.');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import function
importBlogPosts(); 