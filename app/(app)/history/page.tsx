import { redirect } from "next/navigation"
import { ContentList } from "@/components/content-list"
import { createServerSafeClient } from "@/lib/supabase-server"

// Mock data for build time
const MOCK_HISTORY_ITEMS = [
  {
    id: "mock-1",
    title: "Understanding Audio Content Consumption",
    url: "https://example.com/article-1",
    published_at: new Date().toISOString(),
    source: { name: "Mock Source", category_id: "1" },
    audio: [{ file_url: "https://example.com/audio1.mp3", duration: 420, type: "mp3" }]
  },
  {
    id: "mock-2",
    title: "The Future of Audio Learning",
    url: "https://example.com/article-2",
    published_at: new Date().toISOString(),
    source: { name: "Mock Research", category_id: "2" },
    audio: [{ file_url: "https://example.com/audio2.mp3", duration: 360, type: "mp3" }]
  }
];

export default async function HistoryPage() {
  // Build-time safety check - return mock data during build
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    return (
      <div className="container py-6 md:py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">History</h1>
            <p className="text-muted-foreground">Content you've listened to</p>
          </div>
          <ContentList items={MOCK_HISTORY_ITEMS} />
        </div>
      </div>
    );
  }

  // Use the safe server client for auth
  const supabase = createServerSafeClient();

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
        audio:audio_files(file_url, duration, type)
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
        />
      </div>
    </div>
  )
}
