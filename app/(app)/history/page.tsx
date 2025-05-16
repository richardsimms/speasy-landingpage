import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ContentList } from "@/components/content-list"

export default async function HistoryPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get user's read content
  const { data: readContent } = await supabase
    .from("user_content_items")
    .select(`
      *,
      content:content_items(
        id, title, url, published_at,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      )
    `)
    .eq("user_id", session.user.id)
    .eq("is_read", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">History</h1>
          <p className="text-muted-foreground">Content you've listened to</p>
        </div>

        <ContentList
          items={readContent?.map((item) => item.content) || []}
          emptyMessage="You haven't listened to any content yet."
          defaultFilter="all"
        />
      </div>
    </div>
  )
}
