"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentList } from "@/components/content-list"
import { CategoryList } from "@/components/category-list"

interface DashboardClientProps {
  userName: string
  latestContent: any[]
  savedContent: any[]
  submittedUrls: any[]
  categories: any[]
  subscribedCategoryIds: string[]
}

export function DashboardClient({
  userName,
  latestContent,
  savedContent,
  submittedUrls,
  categories,
  subscribedCategoryIds,
}: DashboardClientProps) {
  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>

        <Tabs defaultValue="latest" className="space-y-4">
          <TabsList>
            <TabsTrigger value="latest">Latest Content</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="submitted">Your Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-4">
            <ContentList items={latestContent} />

            {latestContent.length === 0 && (
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
            <ContentList items={savedContent} emptyMessage="You haven't saved any content yet." />
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedUrls.length === 0 ? (
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
                {submittedUrls.map((item) => (
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
          <CategoryList categories={categories} subscribedIds={subscribedCategoryIds} />
        </div>
      </div>
    </div>
  )
}
