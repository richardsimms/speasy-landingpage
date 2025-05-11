import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { logError } from './error-logger.ts'
// @ts-ignore
// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://lmmobnqmxkcdwdhhpwwd.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Simple RSS parser function
async function parseRSS(feedUrl) {
  try {
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`)
    }
    
    const text = await response.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')
    
    const items = Array.from(xml.querySelectorAll('item')).map(item => {
      const title = item.querySelector('title')?.textContent || 'No title'
      const link = item.querySelector('link')?.textContent || ''
      const description = item.querySelector('description')?.textContent || ''
      const pubDate = item.querySelector('pubDate')?.textContent || ''
      
      return {
        title,
        url: link,
        content: description,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
      }
    })
    
    return items
  } catch (error) {
    if (error instanceof Error) {
      logError(
        'refresh-feeds',
        `Error parsing RSS feed: ${error.message}`,
        error,
        'error'
      )
    } else {
      logError(
        'refresh-feeds',
        `Error parsing RSS feed: ${String(error)}`,
        error,
        'error'
      )
    }
    return []
  }
}

// Process a single content source
async function processContentSource(source) {
  console.log(`Processing feed for source: ${source.name} (${source.feed_url})`)
  
  if (!source.feed_url) {
    console.warn(`No feed URL for source ${source.name}, skipping`)
    return { success: false, error: 'No feed URL' }
  }
  
  try {
    // Parse the RSS feed
    const feedItems = await parseRSS(source.feed_url)
    console.log(`Found ${feedItems.length} items in feed`)
    
    if (feedItems.length === 0) {
      return { success: false, error: 'No items found in feed' }
    }
    
    // Process each feed item
    let newItemsCount = 0
    for (const item of feedItems) {
      // Check if content item already exists by URL
      const { data: existingItems } = await supabase
        .from('content_items')
        .select('id')
        .eq('url', item.url)
        .limit(1)
      
      if (existingItems && existingItems.length > 0) {
        console.log(`Item already exists: ${item.title}`)
        continue
      }
      
      // Insert new content item
      const { data: newItem, error } = await supabase
        .from('content_items')
        .insert({
          title: item.title,
          url: item.url,
          content: item.content,
          source_id: source.id,
          published_at: item.published_at
        })
        .select('id')
        .single()
      
      if (error) {
        if (error instanceof Error) {
          logError(
            'refresh-feeds',
            `Error inserting content item: ${error.message}`,
            error,
            'error'
          )
        } else {
          logError(
            'refresh-feeds',
            `Error inserting content item: ${String(error)}`,
            error,
            'error'
          )
        }
        continue
      }
      
      console.log(`Added new content item: ${item.title}`)
      newItemsCount++
      
      // Note: An llm_job will automatically be created due to the database trigger
    }
    
    return { success: true, newItems: newItemsCount }
  } catch (error) {
    if (error instanceof Error) {
      logError(
        'refresh-feeds',
        `Error processing content source: ${error.message}`,
        error,
        'error'
      )
    } else {
      logError(
        'refresh-feeds',
        `Error processing content source: ${String(error)}`,
        error,
        'error'
      )
    }
    return { success: false, error: error.message }
  }
}

// Main function to refresh all feeds
async function refreshFeeds() {
  console.log('Starting feed refresh...')
  
  // Get all content sources with feed URLs
  const { data: sources, error } = await supabase
    .from('content_sources')
    .select('*')
    .not('feed_url', 'is', null)
  
  if (error) {
    if (error instanceof Error) {
      logError(
        'refresh-feeds',
        `Error fetching content sources: ${error.message}`,
        error,
        'error'
      )
    } else {
      logError(
        'refresh-feeds',
        `Error fetching content sources: ${String(error)}`,
        error,
        'error'
      )
    }
    return { success: false, error: error.message }
  }
  
  if (!sources || sources.length === 0) {
    console.log('No sources with feed URLs found')
    return { success: true, processed: 0 }
  }
  
  console.log(`Found ${sources.length} sources with feed URLs`)
  
  // Process each source
  const results = []
  for (const source of sources) {
    const result = await processContentSource(source)
    results.push({
      source: source.name,
      ...result
    })
  }
  
  // After processing all feeds, trigger the process_llm_job function
  // to start processing any new LLM jobs that were created
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/process_llm_job`
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn(`Warning: Failed to trigger process_llm_job: ${response.status} ${response.statusText}`)
    } else {
      console.log('Successfully triggered process_llm_job function')
    }
  } catch (error) {
    if (error instanceof Error) {
      logError(
        'refresh-feeds',
        `Error triggering process_llm_job: ${error.message}`,
        error,
        'warning'
      )
    } else {
      logError(
        'refresh-feeds',
        `Error triggering process_llm_job: ${String(error)}`,
        error,
        'warning'
      )
    }
  }
  
  return {
    success: true,
    sources: sources.length,
    results
  }
}

// Deno Deploy handler
Deno.serve(async (req) => {
  // Allow CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    })
  }
  
  try {
    const result = await refreshFeeds()
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    if (error instanceof Error) {
      logError(
        'refresh-feeds',
        `Unhandled error: ${error.message}`,
        error,
        'critical'
      )
    } else {
      logError(
        'refresh-feeds',
        `Unhandled error: ${String(error)}`,
        error,
        'critical'
      )
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function updateJobStatus(jobId: string, status: string) {
  // TODO: implement
}
