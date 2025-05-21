import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { OpenAI } from 'https://esm.sh/openai@4.18.0';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

let parserInitialized = false;
async function ensureParserReady() {
  if (!parserInitialized) {
    // initialise parser here if needed
    parserInitialized = true;
  }
}

// ─── Supabase & OpenAI Setup ──────────────────────────────────────────
const sb = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_KEY')
});

const elevenKey = Deno.env.get('ELEVEN_KEY');

// ─── Job Status Helpers ───────────────────────────────────────────────
async function markJobRunning(jobId: string) {
  console.log(`Job ${jobId} marked as running`);
  try {
    const { error } = await sb.from('llm_jobs').update({ status: 'running' }).eq('id', jobId);
    if (error) {
      console.error(`Failed to mark job ${jobId} as running: ${error.message}`);
    }
  } catch (err) {
    console.error(`Exception when marking job ${jobId} as running: ${err.message}`);
  }
}

async function markJobDone(jobId: string) {
  console.log(`Job ${jobId} marked as done`);
  try {
    const { error } = await sb.from('llm_jobs').update({ status: 'done' }).eq('id', jobId);
    if (error) {
      console.error(`Failed to mark job ${jobId} as done: ${error.message}`);
    }
  } catch (err) {
    console.error(`Exception when marking job ${jobId} as done: ${err.message}`);
  }
}

async function markJobError(jobId: string, message: string) {
  console.error(`Job ${jobId} failed: ${message}`);
  try {
    // Only update the status column, don't try to update error_message as it doesn't exist
    const { error } = await sb
      .from('llm_jobs')
      .update({ status: 'error' })
      .eq('id', jobId);
    if (error) {
      console.error(`Failed to mark job ${jobId} as error: ${error.message}`);
    }
  } catch (err) {
    console.error(`Exception when marking job ${jobId} as error: ${err.message}`);
  }
}

// ─── Scraper Util ─────────────────────────────────────────────────────
function extractMainContent(html: string, url: string) {
  const $ = cheerio.load(html);
  const hostname = new URL(url).hostname.replace(/^www\./, '');

  const selectorMap: Record<string, string[]> = {
    'substack.com': ['div.post-body', 'div.body', 'article'],
    'medium.com': ['article'],
    'ghost.io': ['.post-content', 'article'],
    'wordpress.com': ['.entry-content', 'article'],
    'densediscovery.com': ['#main-content', 'article'],
    'typefully.com': ['article']
  };

  const selectors = selectorMap[hostname] || ['article', 'body'];

  for (const selector of selectors) {
    const content = $(selector).text().trim();
    if (content.length > 200) return content;
  }

  // fallback: longest text in body
  let maxLength = 0;
  let bestText = '';
  $('body *').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > maxLength) {
      maxLength = text.length;
      bestText = text;
    }
  });

  return bestText;
}

function cleanText(raw: string) {
  return raw.replace(/\s+/g, ' ').replace(/(subscribe|get the app|log in).*/gi, '').trim();
}

// ─── Main Loop ────────────────────────────────────────────────────────
Deno.serve(async () => {
  try {
    const { data: jobs, error: jobsError } = await sb.from('llm_jobs').select('id, content_id').eq('status', 'pending');

    if (jobsError) {
      console.error(`Failed to fetch pending jobs: ${jobsError.message}`);
      return new Response(`Error fetching jobs: ${jobsError.message}`, { status: 500 });
    }

    if (!jobs || jobs.length === 0) return new Response('idle');

    // Process only one job at a time to avoid timeouts
    const job = jobs[0];
    
    try {
      await markJobRunning(job.id);

      const { data: item, error: itemError } = await sb
        .from('content_items')
        .select('id, title, url, content')
        .eq('id', job.content_id)
        .single();

      if (itemError) {
        await markJobError(job.id, `Failed to fetch content item: ${itemError.message}`);
        return new Response(`Processed with error`, { status: 200 });
      }

      if (!item) {
        await markJobError(job.id, 'Job content item not found');
        return new Response(`Processed with error`, { status: 200 });
      }

      let content: string = item?.content?.trim() || '';

      if (!content && item.url) {
        try {
          const res = await fetch(item.url);
          if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
          const html = await res.text();
          const rawExtract = extractMainContent(html, item.url);
          content = cleanText(rawExtract);
        } catch (err: any) {
          await markJobError(job.id, `Scraping failed: ${err.message}`);
          return new Response(`Processed with error`, { status: 200 });
        }
      }

      if (!content || content.length < 100) {
        await markJobError(job.id, 'No content available after scraping');
        return new Response(`Processed with error`, { status: 200 });
      }

      // ── Summarise ──
      let summary = '';
      try {
        const { choices } = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI designed to act as a personalized podcast producer and audio news presenter for busy professionals. Your task is to transform written newsletter articles into engaging, concise audio summaries that keep listeners inspired and informed, even on their busiest days. Please follow these instructions to create an effective audio summary: Voice and Style: Speak as a dynamic, uplifting newsroom presenter. Use an energetic, action-oriented, and optimistic tone. Address the audience directly, as if you are their trusted guide to the latest ideas shaping their world. Summary Structure: Provide a short summary that: a) Clearly explains why this knowledge matters for professionals, highlighting its relevance, impact, or practical value. b) Spotlights the most exciting change, breakthrough, or idea introduced in the article. Attribution: Attribute the summary to the author or publisher, e.g., "According to [Author] at [Publisher]…" Engagement: End the summary with a call to action or a thought-provoking note, encouraging listeners to reflect or take the next step. Constraints: Avoid jargon and keep language accessible. Use complete, flowing sentences instead of lists or bullet points. Never fabricate facts or attribute opinions not present in the source.'
            },
            { role: 'user', content: content.slice(0, 12000) }
          ]
        });
        summary = choices[0].message.content.trim();
      } catch (err: any) {
        await markJobError(job.id, `OpenAI summary failed: ${err.message}`);
        return new Response(`Processed with error`, { status: 200 });
      }

      // ── Text to Speech ──
      let audioArrayBuf: ArrayBuffer;
      try {
        const ttsResp = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${Deno.env.get('OPENAI_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1-hd',
            input: summary,
            voice: 'shimmer',
            response_format: 'mp3'
          })
        });

        if (!ttsResp.ok) {
          const errorText = await ttsResp.text();
          await markJobError(job.id, `OpenAI TTS failed: ${ttsResp.status} ${errorText}`);
          return new Response(`Processed with error`, { status: 200 });
        }

        audioArrayBuf = await ttsResp.arrayBuffer();
      } catch (err: any) {
        await markJobError(job.id, `OpenAI TTS conversion failed: ${err.message}`);
        return new Response(`Processed with error`, { status: 200 });
      }

      const fileName =
        (typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : crypto.getRandomValues(new Uint8Array(16)).join('')) + '.mp3';

      const { error: uploadError } = await sb.storage
        .from('audio')
        .upload(fileName, new Uint8Array(audioArrayBuf), {
          contentType: 'audio/mpeg'
        });

      if (uploadError) {
        await markJobError(job.id, `Storage upload failed: ${uploadError.message}`);
        return new Response(`Processed with error`, { status: 200 });
      }

      const { data: urlData, error: urlError } = sb.storage.from('audio').getPublicUrl(fileName);
      
      if (urlError) {
        await markJobError(job.id, `Failed to get public URL: ${urlError.message}`);
        return new Response(`Processed with error`, { status: 200 });
      }
      
      const publicAudioUrl = urlData.publicUrl;

      const { error: updateError } = await sb.from('content_items').update({ summary }).eq('id', item.id);
      if (updateError) {
        console.error(`Failed to update content item with summary: ${updateError.message}`);
      }

      const { error: audioError } = await sb.from('audio_files').insert({
        content_id: item.id,
        file_url: publicAudioUrl,
        duration: null,
        format: 'mp3',
        type: 'summary'
      });
      
      if (audioError) {
        await markJobError(job.id, `Failed to insert audio file: ${audioError.message}`);
        return new Response(`Processed with error`, { status: 200 });
      }

      await markJobDone(job.id);
      return new Response('processed successfully', { status: 200 });
    } catch (err: any) {
      console.error(`Unhandled error processing job ${job.id}: ${err.message}`);
      try {
        await markJobError(job.id, `Unhandled error: ${err.message}`);
      } catch (markErr: any) {
        console.error(`Failed to mark job as error: ${markErr.message}`);
      }
      return new Response(`Unhandled error: ${err.message}`, { status: 500 });
    }
  } catch (err: any) {
    console.error(`Critical error in edge function: ${err.message}`);
    return new Response(`Critical error: ${err.message}`, { status: 500 });
  }
}); 