# Speasy Edge Functions Documentation

This document outlines the edge functions used in the Speasy application for content processing and audio generation. Edge functions are serverless functions running on Supabase's infrastructure that handle background processing tasks.

## System Overview

The Speasy application uses Supabase Edge Functions to handle background processing tasks. The system is primarily concerned with:

1. Refreshing content from RSS feeds
2. Processing content items with LLM (Large Language Models) to generate summaries
3. Converting these summaries into audio files

## Edge Functions Architecture

![Edge Functions Architecture](https://i.imgur.com/sIGtBZf.png)

### Key Components

- **Supabase Edge Functions**: Serverless functions running on Deno Deploy
- **GitHub Actions**: Scheduled triggers for the edge functions
- **Supabase Database**: Stores content and processing status
- **Database Triggers**: Automatically create jobs when new content is added

## Edge Functions

### 1. `refresh_feeds`

This edge function is responsible for pulling new content from configured RSS feed sources.

**File Location**: `supabase/functions/refresh_feeds/index.ts`

#### Execution Schedule
- Runs daily at midnight UTC via GitHub Actions (`.github/workflows/schedule-edge-function.yml`)
- Can be triggered manually through API calls

#### Workflow
1. Fetches all content sources with valid feed URLs from the `content_sources` table
2. For each source, parses the RSS feed and extracts content items
3. Checks for existing items (by URL) to avoid duplicates
4. Inserts new content items into the `content_items` table
5. Relies on a database trigger to automatically create corresponding `llm_jobs` entries
6. After processing all feeds, it triggers the `process_llm_job` function to start processing any new jobs

#### Key Components
- Uses the native DOMParser for RSS parsing
- Handles failure gracefully for individual feed sources
- Reports detailed logs about processing status

#### Implementation Details

```typescript
// Main function to refresh all feeds
async function refreshFeeds() {
  console.log('Starting feed refresh...')
  
  // Get all content sources with feed URLs
  const { data: sources, error } = await supabase
    .from('content_sources')
    .select('*')
    .not('feed_url', 'is', null)
  
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
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/process_llm_job`
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.warn(`Warning: Error triggering process_llm_job: ${error.message}`)
  }
}
```

### 2. `process_llm_job`

This edge function processes pending LLM jobs to generate summaries and audio files.

**File Location**: `supabase/functions/process_llm_job/index.ts`

#### Execution Schedule
- Runs every 5 minutes via GitHub Actions (`.github/workflows/process-llm-jobs.yml`)
- Triggered by the `refresh_feeds` function after new content is added
- Can be triggered manually through GitHub Actions or API calls

#### Workflow
1. Fetches a single pending job from the `llm_jobs` table
2. Updates the job status to 'running'
3. Retrieves the associated content item
4. Processes the content (in a real implementation this would use LLM to summarize content)
5. Creates an audio file record in the `audio_files` table
6. Updates the job status to 'done' when complete

#### Key Features
- Processes one job at a time to prevent API rate limiting issues
- Includes error handling to mark failed jobs
- Maintains clean status transitions (pending → running → done/error)

#### Implementation Details

```typescript
// Main function to process LLM jobs
async function processLLMJobs() {
  console.log('Processing LLM jobs...')
  
  // Get a job to process (limit to 1 job at a time)
  const { data: jobs, error } = await supabase
    .from('llm_jobs')
    .select('id, content_id')
    .eq('status', 'pending')
    .limit(1)
  
  if (!jobs || jobs.length === 0) {
    console.log('No pending jobs found')
    return { success: true, processed: 0 }
  }
  
  const job = jobs[0]
  
  // Mark the job as running
  const updateSuccess = await updateJobStatus(job.id, 'running')
  
  try {
    // Get the content item
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', job.content_id)
      .single()
    
    // Create an audio file record
    const { error: audioError } = await supabase
      .from('audio_files')
      .insert({
        content_id: job.content_id,
        file_url: `https://example.com/audio/${job.content_id}.mp3`,
        duration: 120,
        format: 'mp3',
        type: 'summary'
      })
    
    // Mark the job as done
    await updateJobStatus(job.id, 'done')
    
    return { success: true, processed: 1, jobId: job.id }
  } catch (err) {
    console.error(`Error processing job: ${err.message}`)
    await updateJobStatus(job.id, 'error')
    return { success: false, error: err.message }
  }
}
```

## Database Integration

### Tables

- **`content_sources`**: Stores information about content providers and their RSS feeds
  - `id`: UUID
  - `name`: Name of the source
  - `url`: Website URL
  - `feed_url`: RSS feed URL
  - `category_id`: Category UUID

- **`content_items`**: Contains the actual content retrieved from feeds
  - `id`: UUID
  - `title`: Content title
  - `url`: Original content URL
  - `content`: Full content text
  - `summary`: AI-generated summary (if available)
  - `source_id`: Reference to content_sources
  - `published_at`: Publication timestamp

- **`llm_jobs`**: Tracks the processing status of content items
  - `id`: UUID
  - `content_id`: Reference to content_items
  - `status`: 'pending', 'running', 'done', or 'error'
  - `created_at`: Creation timestamp

- **`audio_files`**: Stores generated audio summaries
  - `id`: UUID
  - `content_id`: Reference to content_items
  - `file_url`: URL to the audio file
  - `duration`: Duration in seconds
  - `format`: Audio format (e.g., 'mp3')
  - `type`: 'summary' or 'full'

### Triggers

The key database trigger `content_items_after_insert` runs the `enqueue_llm_job` function whenever a new content item is inserted:

```sql
CREATE OR REPLACE FUNCTION public.enqueue_llm_job()
RETURNS TRIGGER AS $$
begin
  insert into llm_jobs(content_id) values(new.id);
  return new;
end;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_items_after_insert
  AFTER INSERT ON content_items
  FOR EACH ROW EXECUTE PROCEDURE enqueue_llm_job();
```

## Deployment and Configuration

### Deploying Edge Functions

To deploy or update edge functions:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy a specific function
supabase functions deploy refresh_feeds --project-ref=lmmobnqmxkcdwdhhpwwd

# Deploy all functions
supabase functions deploy --project-ref=lmmobnqmxkcdwdhhpwwd
```

### GitHub Actions Configuration

The project uses GitHub Actions to schedule the edge functions:

1. **`.github/workflows/schedule-edge-function.yml`**:
   ```yaml
   name: Schedule Edge Function
   on:
     schedule:
       - cron: '0 0 * * *'  # Daily at midnight UTC
   jobs:
     run-edge-function:
       runs-on: ubuntu-latest
       steps:
         - name: Call Edge Function
           run: |
             curl -X POST https://lmmobnqmxkcdwdhhpwwd.supabase.co/functions/v1/refresh_feeds
   ```

2. **`.github/workflows/process-llm-jobs.yml`**:
   ```yaml
   name: Process LLM Jobs
   on:
     schedule:
       - cron: '*/5 * * * *'  # Every 5 minutes
     workflow_dispatch:        # Manual trigger
   jobs:
     run-edge-function:
       runs-on: ubuntu-latest
       steps:
         - name: Call Edge Function
           run: |
             curl -X POST https://lmmobnqmxkcdwdhhpwwd.supabase.co/functions/v1/process_llm_job
   ```

## Error Handling and Debugging

Both edge functions include comprehensive error handling:

1. Each function logs error messages to assist with debugging
2. Failed jobs are marked with an 'error' status
3. Individual item failures don't prevent other items from being processed
4. Network errors when triggering downstream functions are caught and logged

### Monitoring and Debugging

To monitor the status of the system:

1. Check the GitHub Actions logs for scheduled runs
2. Query the database for job status:
   ```sql
   SELECT status, COUNT(*) FROM llm_jobs GROUP BY status;
   ```
3. Check Supabase Edge Function logs in the Supabase dashboard

## Security Considerations

The edge functions use the Supabase service role key to interact with the database, which allows them to bypass Row Level Security (RLS) policies. This is necessary for background processing tasks.

Security best practices:
- Never expose the service role key in client-side code
- Use environment variables for sensitive values
- Consider using more granular permissions if possible

## Scaling and Performance

The current implementation has several considerations for scaling:

1. `process_llm_job` processes one job at a time to prevent rate limiting issues with external APIs
2. To handle a large backlog, the function is called frequently (every 5 minutes)
3. For significantly higher loads, the function could be modified to batch process jobs

## Troubleshooting Guide

If you notice a backlog of unprocessed LLM jobs (status = 'pending'), here are steps to diagnose and resolve the issue:

### Diagnosis

1. **Check job counts by status**:
   ```sql
   SELECT status, COUNT(*) FROM llm_jobs GROUP BY status;
   ```

2. **Verify the GitHub Actions workflow**:
   - Navigate to the GitHub repository's "Actions" tab
   - Look for the "Process LLM Jobs" workflow
   - Check if it's running successfully at the expected 5-minute intervals

3. **Test the edge function directly**:
   ```bash
   curl -X POST https://lmmobnqmxkcdwdhhpwwd.supabase.co/functions/v1/process_llm_job
   ```

4. **Check for jobs stuck in 'running' state**:
   ```sql
   SELECT * FROM llm_jobs WHERE status = 'running' ORDER BY created_at;
   ```
   - If jobs have been in 'running' status for a long time, they may be stalled

### Resolution Steps

1. **Ensure the process_llm_job function is invoked regularly**
2. **Manually process backlog** by triggering the workflow manually
3. **Reset stalled jobs** with:
   ```sql
   UPDATE llm_jobs SET status = 'pending' WHERE status = 'running';
   ```

## Future Improvements

Potential enhancements to the system:

1. Add job priority levels to process important content first
2. Implement retries for failed jobs with exponential backoff
3. Add webhook notifications for completed jobs
4. Create a dashboard to monitor job processing status in real-time
5. Implement more sophisticated content summarization with multiple LLM options

## Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 