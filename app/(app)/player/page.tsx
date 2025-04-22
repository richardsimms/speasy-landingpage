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

  // Process audio files for playback
  if (contentItem?.audio && contentItem.audio.length > 0) {
    try {
      // Instead of trying to create signed URLs, we'll use the direct download URL
      // This works if the bucket is public or has proper RLS policies
      const audioPath = contentItem.audio[0].file_url;
      
      // If the URL is already a full URL, use it as is
      if (audioPath.startsWith('http')) {
        console.log("Using provided URL:", audioPath);
        
        // Add cache buster to prevent caching issues
        if (!audioPath.includes('?')) {
          contentItem.audio[0].file_url = `${audioPath}?t=${Date.now()}`;
        }
      } else {
        // For filenames or partial paths, construct a public download URL
        let filename = audioPath;
        
        // Extract filename if it's a path
        if (audioPath.includes('/')) {
          const parts = audioPath.split('/');
          filename = parts[parts.length - 1];
        }
        
        // Create a temporary anonymous key URL that should work without authentication
        // Using the download endpoint rather than the public endpoint
        const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmmobnqmxkcdwdhhpwwd.supabase.co'}/storage/v1/object/public/audio/${filename}`;
        contentItem.audio[0].file_url = downloadUrl;
        console.log("Using direct download URL:", downloadUrl);
        
        // Create a cache-busting URL to prevent CORS issues
        contentItem.audio[0].file_url = `${downloadUrl}?t=${Date.now()}`;
      }
      
      // Check if the public bucket is accessible (won't work server-side but useful for debugging)
      console.log("Audio file path being used:", contentItem.audio[0].file_url);
      
    } catch (err) {
      console.error("Failed to process audio URL:", err);
    }
  } else {
    console.warn("No audio files found for this content item");
  }

  return (
    <div className="container py-6 md:py-10">
      <AudioPlayer contentItem={contentItem} relatedContent={relatedContent || []} />
    </div>
  )
}
