import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ContentList } from "@/components/content-list"

export default async function SavedPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Use getUser for better security
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user's saved content
  const { data: savedContent } = await supabase
    .from("user_content_items")
    .select(`
      *,
      content:content_items(
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      )
    `)
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Saved Content</h1>
          <p className="text-muted-foreground">Content you've saved for later</p>
        </div>

        <ContentList
          items={savedContent?.map((item) => item.content) || []}
          emptyMessage="You haven't saved any content yet."
          defaultFilter="all"
        />
      </div>
    </div>
  )
}
