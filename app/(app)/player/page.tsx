import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AudioPlayer } from "@/components/audio-player"

interface PlayerPageProps {
  searchParams: {
    id?: string
  }
}

export default async function PlayerPage({ searchParams }: PlayerPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // If no ID is provided, get the latest content item with audio
  if (!searchParams.id) {
    const { data: latestContent } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type)
      `)
      .order("published_at", { ascending: false })
      .limit(1)

    if (latestContent && latestContent.length > 0) {
      redirect(`/player?id=${latestContent[0].id}`)
    }
  }

  // Get the content item
  const { data: contentItem } = await supabase
    .from("content_items")
    .select(`
      *,
      source:content_sources(name, category_id),
      audio:audio_files(file_url, duration, type)
    `)
    .eq("id", searchParams.id)
    .single()

  if (!contentItem) {
    redirect("/dashboard")
  }

  // Get related content items
  const { data: relatedContent } = await supabase
    .from("content_items")
    .select(`
      *,
      source:content_sources(name),
      audio:audio_files(file_url, duration, type)
    `)
    .eq("source.category_id", contentItem.source?.category_id)
    .neq("id", contentItem.id)
    .order("published_at", { ascending: false })
    .limit(5)

  // Create a signed URL for the audio file
  if (contentItem.audio && contentItem.audio.length > 0) {
    try {
      // Extract just the filename if it's a full path or URL
      let audioPath = contentItem.audio[0].file_url;
      
      // If it's already a full URL with a token, don't try to re-sign it
      if (!audioPath.includes('token=')) {
        // Remove any URL prefix if present to get just the path/filename
        if (audioPath.includes('://')) {
          const url = new URL(audioPath);
          audioPath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
        }
        
        // If it's a path like "audio/filename.mp3", make sure we just get "filename.mp3"
        if (audioPath.startsWith('audio/')) {
          audioPath = audioPath;
        } else {
          audioPath = `${audioPath}`;
        }
        
        console.log("Getting signed URL for:", audioPath);
        const { data, error } = await supabase.storage.from('audio').createSignedUrl(audioPath, 60 * 60); // 1 hour expiry
        
        if (error) {
          console.error("Error creating signed URL:", error);
        } else if (data?.signedUrl) {
          contentItem.audio[0].file_url = data.signedUrl;
          console.log("Successfully generated signed URL");
        }
      } else {
        console.log("URL already contains a token, using as is");
      }
    } catch (err) {
      console.error("Failed to process audio URL:", err);
    }
  }

  return (
    <div className="container py-6 md:py-10">
      <AudioPlayer contentItem={contentItem} relatedContent={relatedContent || []} />
    </div>
  )
}
