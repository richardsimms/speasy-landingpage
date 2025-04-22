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
      // Extract just the filename from the path
      let audioPath = contentItem.audio[0].file_url;
      
      // If it's already a full URL with a token, don't try to re-sign it
      if (!audioPath.includes('token=')) {
        // The logs show we're trying to sign a full path instead of just the filename
        // Extract just the UUID filename from the path
        
        // First, check if it's a full URL or just a path
        if (audioPath.includes('/object/public/audio/')) {
          // Extract the filename from paths like "storage/v1/object/public/audio/6dcd43a5-81e9-4f73-9225-ff8ae7a009d1.mp3"
          const matches = audioPath.match(/\/audio\/([^\/]+\.mp3)$/);
          if (matches && matches[1]) {
            audioPath = matches[1];
          }
        } else if (audioPath.includes('/')) {
          // Handle simple path like "audio/filename.mp3"
          const parts = audioPath.split('/');
          audioPath = parts[parts.length - 1];
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
