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
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Extract the ID from searchParams
  const contentId = searchParams.id

  // If no ID is provided, get the latest content item with audio
  if (!contentId) {
    const { data: latestContent } = await supabase
      .from("content_items")
      .select(`
        id, title, url, published_at,
        source:content_sources(name),
        audio:audio_files(file_url, duration)
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
    .eq("id", contentId)
    .single()

  if (!contentItem) {
    redirect("/dashboard")
  }

  // Get related content
  const { data: relatedContent = [] } = await supabase
    .from("content_items")
    .select(`
      id, title, url, description, published_at,
      source:content_sources(name),
      audio:audio_files(file_url, duration)
    `)
    .eq("source.category_id", contentItem.source?.category_id)
    .neq("id", contentId)
    .order("published_at", { ascending: false })
    .limit(5)

  // Process audio files for playback - using public URLs
  if (contentItem?.audio && contentItem.audio.length > 0) {
    try {
      const audioPath = contentItem.audio[0].file_url;
      
      // If it's already a full URL, use it as is
      if (audioPath.startsWith('http')) {
        console.log("Using existing URL:", audioPath);
      } else {
        // Get just the filename regardless of what's stored in the database
        let filename = audioPath;
        
        // If it's a full URL or path, extract just the filename
        if (audioPath.includes('/')) {
          const parts = audioPath.split('/');
          filename = parts[parts.length - 1];
        }
        
        // Create a public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmmobnqmxkcdwdhhpwwd.supabase.co'}/storage/v1/object/public/audio/${filename}`;
        contentItem.audio[0].file_url = publicUrl;
        console.log("Using public URL:", publicUrl);
      }
      
    } catch (err) {
      console.error("Failed to process audio URL:", err);
    }
  } else {
    console.warn("No audio files found for this content item");
  }

  // Add debug info to the content item for client-side debugging
  if (process.env.NODE_ENV === 'development') {
    contentItem._debug = {
      audioUrl: contentItem?.audio?.[0]?.file_url || 'No audio URL',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <AudioPlayer contentItem={contentItem} relatedContent={relatedContent || []} />
    </div>
  )
}
