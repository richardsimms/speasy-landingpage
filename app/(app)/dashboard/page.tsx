"use client"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentList } from "@/components/content-list"
import { CategoryList } from "@/components/category-list"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user profile
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get user's subscribed categories
  const { data: subscriptions } = await supabase
    .from("user_category_subscriptions")
    .select("category_id")
    .eq("user_id", session.user.id)

  const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || []

  // Get latest content items
  const { data: latestContent } = await supabase
    .from("content_items")
    .select(`
      *,
      source:content_sources(name, category_id),
      audio:audio_files(file_url, duration, type)
    `)
    .order("published_at", { ascending: false })
    .limit(10)

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
    .limit(10)

  // Get user's submitted URLs
  const { data: submittedUrls } = await supabase
    .from("user_submitted_urls")
    .select(`
      *,
      content:content_items(
        *,
        audio:audio_files(file_url, duration, type)
      )
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.email?.split("@")[0]}</p>
        </div>

        <Tabs defaultValue="latest" className="space-y-4">
          <TabsList>
            <TabsTrigger value="latest">Latest Content</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="submitted">Your Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-4">
            <ContentList items={latestContent || []} />

            {latestContent?.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No content yet</CardTitle>
                  <CardDescription>Subscribe to categories or add your own content to get started.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild>
                    <Link href="/settings/subscriptions">Manage Subscriptions</Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <ContentList
              items={savedContent?.map((item) => item.content) || []}
              emptyMessage="You haven't saved any content yet."
            />
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedUrls?.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No submitted content</CardTitle>
                  <CardDescription>Add URLs to convert them to audio.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        document.dispatchEvent(new CustomEvent("open-add-content"))
                      }}
                    >
                      Add Content
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-4">
                {submittedUrls?.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title || item.url}</CardTitle>
                      <CardDescription>
                        Status: <span className="capitalize">{item.status}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground truncate">{item.url}</p>
                    </CardContent>
                    <CardFooter>
                      {item.content ? (
                        <Button asChild>
                          <Link href={`/player?id=${item.content.id}`}>Listen</Link>
                        </Button>
                      ) : (
                        <Button disabled>Processing</Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Categories</h2>
          <CategoryList categories={categories || []} subscribedIds={subscribedCategoryIds} />
        </div>
      </div>
    </div>
  )
}
