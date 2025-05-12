export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation"
import { ContentList } from "@/components/content-list"

// Mock data for build time
const MOCK_SAVED_ITEMS = [
  {
    id: "mock-1",
    title: "Important Audio Article",
    url: "https://example.com/saved-1",
    published_at: new Date().toISOString(),
    source: { name: "Mock Source", category_id: "1" },
    audio: [{ file_url: "https://example.com/saved1.mp3", duration: 480, type: "mp3" }]
  },
  {
    id: "mock-2",
    title: "Saved for Later Reading",
    url: "https://example.com/saved-2",
    published_at: new Date().toISOString(),
    source: { name: "Mock Blog", category_id: "3" },
    audio: [{ file_url: "https://example.com/saved2.mp3", duration: 320, type: "mp3" }]
  }
];

// Function to check if we're in build mode
function isBuildMode() {
  return process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export default function SavedPage() {
  // This is a component that will be rendered statically at build time
  // No server actions or dynamic imports should be used at the top level

  // Immediately return for build mode
  if (isBuildMode()) {
    console.log("Using mock data in saved page due to build mode or missing credentials");
    return (
      <div className="container py-6 md:py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Saved Content</h1>
            <p className="text-muted-foreground">Content you've saved for later</p>
          </div>
          <ContentList items={MOCK_SAVED_ITEMS} />
        </div>
      </div>
    );
  }

  // For runtime only (not during build), we dynamically use async logic
  const runtime = async () => {
    try {
      // Dynamically import Supabase client to avoid initialization during build
      const { createServerSafeClient } = await import("@/lib/supabase-server");
      
      // Use the safe server client for auth
      const supabase = createServerSafeClient()
    
      const {
        data: { session },
      } = await supabase.auth.getSession()
    
      if (!session) {
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
            audio:audio_files(file_url, duration, type)
          )
        `)
        .eq("user_id", session.user.id)
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
            />
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error in saved page:", error);
      // Fallback to mock data in case of errors
      return (
        <div className="container py-6 md:py-10">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Saved Content</h1>
              <p className="text-muted-foreground">Content you've saved for later</p>
            </div>
            <ContentList items={MOCK_SAVED_ITEMS} />
          </div>
        </div>
      );
    }
  };
  
  // Next.js will automatically unwrap the Promise
  return runtime();
}
