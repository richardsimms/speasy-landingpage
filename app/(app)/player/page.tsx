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

  return (
    <div className="container py-6 md:py-10">
      <AudioPlayer contentItem={contentItem} relatedContent={relatedContent || []} />
    </div>
  )
}
