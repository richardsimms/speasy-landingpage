import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { logError } from './error-logger.ts'
// @ts-ignore
// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://lmmobnqmxkcdwdhhpwwd.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to update LLM job status
async function updateJobStatus(jobId, status) {
  const { error } = await supabase
    .from('llm_jobs')
    .update({ status })
    .eq('id', jobId)
  
  if (error) {
    logError(
      'process-llm-job',
      `Error updating job status: ${error.message}`,
      error,
      'error'
    )
    return false
  }
  return true
}

// Main function to process LLM jobs
async function processLLMJobs() {
  console.log('Processing LLM jobs...')
  
  // Get a job to process (limit to 1 job at a time)
  const { data: jobs, error } = await supabase
    .from('llm_jobs')
    .select('id, content_id')
    .eq('status', 'pending')
    .limit(1)
  
  if (error) {
    logError(
      'process-llm-job',
      `Error fetching pending jobs: ${error.message}`,
      error,
      'error'
    )
    return { success: false, error: error.message }
  }
  
  if (!jobs || jobs.length === 0) {
    console.log('No pending jobs found')
    return { success: true, processed: 0 }
  }
  
  const job = jobs[0]
  console.log(`Processing job ${job.id} for content ${job.content_id}`)
  
  // Mark the job as running
  const updateSuccess = await updateJobStatus(job.id, 'running')
  if (!updateSuccess) {
    return { success: false, error: 'Failed to update job status' }
  }
  
  try {
    // Get the content item
    const { data: contentItem, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', job.content_id)
      .single()
    
    if (contentError || !contentItem) {
      logError(
        'process-llm-job',
        `Error fetching content item: ${contentError?.message || 'Content not found'}`,
        contentError || { message: 'Content not found' },
        'error'
      )
      await updateJobStatus(job.id, 'error')
      return { success: false, error: contentError?.message || 'Content not found' }
    }
    
    // Process the content (this would typically involve AI summarization,
    // generating audio, etc., but is simplified here)
    console.log(`Processing content: ${contentItem.title}`)
    
    // Check if audio file already exists
    const { data: existingAudio } = await supabase
      .from('audio_files')
      .select('id')
      .eq('content_id', job.content_id)
      .limit(1)
    
    // Create an audio file record if needed
    if (!existingAudio || existingAudio.length === 0) {
      // In a real implementation, this would generate actual audio and upload it to storage
      const { error: audioError } = await supabase
        .from('audio_files')
        .insert({
          content_id: job.content_id,
          file_url: `https://example.com/audio/${job.content_id}.mp3`, // This is just a placeholder
          duration: 120, // Example duration in seconds
          format: 'mp3',
          type: 'summary'
        })
      
      if (audioError) {
        logError(
          'process-llm-job',
          `Error creating audio file: ${audioError.message}`,
          audioError,
          'error'
        )
        await updateJobStatus(job.id, 'error')
        return { success: false, error: audioError.message }
      }
    }
    
    // Mark the job as done
    await updateJobStatus(job.id, 'done')
    
    return { success: true, processed: 1, jobId: job.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(
      'process-llm-job',
      `Error processing job: ${errorMessage}`,
      err,
      'error'
    )
    await updateJobStatus(job.id, 'error')
    return { success: false, error: errorMessage }
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
    const result = await processLLMJobs()
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(
      'process-llm-job',
      `Unhandled error: ${errorMessage}`,
      error,
      'critical'
    )
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
