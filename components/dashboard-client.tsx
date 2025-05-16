"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentList } from "@/components/content-list"
import { CategoryList } from "@/components/category-list"
import OnboardingPageClient from "@/app/(app)/onboarding/OnboardingPageClient"

interface DashboardClientProps {
  userName: string
  latestContent: any[]
  savedContent: any[]
  submittedUrls: any[]
  categories: any[]
  subscribedCategoryIds: string[]
  isOnboarding?: boolean
}

export function DashboardClient({
  userName,
  latestContent,
  savedContent,
  submittedUrls,
  categories,
  subscribedCategoryIds,
  isOnboarding,
}: DashboardClientProps) {
  if (isOnboarding || !subscribedCategoryIds || subscribedCategoryIds.length === 0) {
    return <OnboardingPageClient userId={userName} />;
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>

        <Tabs defaultValue="latest" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest" className="text-xs md:text-sm">Latest</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs md:text-sm">Saved</TabsTrigger>
            <TabsTrigger value="submitted" className="text-xs md:text-sm">Your Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-4">
            <ContentList items={latestContent} defaultFilter="unread" />

            {latestContent.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">No content yet</CardTitle>
                  <CardDescription className="text-sm md:text-base">Subscribe to categories or add your own content to get started.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full md:w-auto">
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
                  <CardTitle className="text-lg md:text-xl">No submitted content</CardTitle>
                  <CardDescription className="text-sm md:text-base">Add URLs to convert them to audio.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full md:w-auto">
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
                      <CardTitle className="text-base md:text-lg line-clamp-2">{item.title || item.url}</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Status: <span className="capitalize">{item.status}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{item.url}</p>
                    </CardContent>
                    <CardFooter>
                      {item.content ? (
                        <Button asChild className="w-full md:w-auto">
                          <Link href={`/player?id=${item.content.id}`}>Listen</Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full md:w-auto">Processing</Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight mb-4 md:text-2xl">Categories</h2>
          <CategoryList categories={categories} subscribedIds={subscribedCategoryIds} />
        </div>
      </div>
    </div>
  )
}
