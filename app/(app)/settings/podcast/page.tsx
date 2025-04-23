"use client"

import { useState, useEffect } from "react"
import { Check, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase"

export default function PodcastSettingsPage() {
  const [podcastFeed, setPodcastFeed] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadPodcastFeed() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data: feed } = await supabase
          .from("podcast_feeds")
          .select("feed_url")
          .eq("user_id", session.user.id)
          .eq("is_default", true)
          .single()

        if (feed) {
          setPodcastFeed(feed.feed_url)
        }
      }
    }

    loadPodcastFeed()
  }, [supabase])

  const handleCopyFeed = () => {
    if (podcastFeed) {
      navigator.clipboard.writeText(podcastFeed)
      setIsCopied(true)

      toast({
        title: "Feed URL copied",
        description: "The podcast feed URL has been copied to your clipboard.",
      })

      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }

  const handleRegenerateFeed = async () => {
    setIsLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      // Generate a new feed URL with the correct format
      const feedId = Date.now().toString()
      const newFeedUrl = `${window.location.origin}/api/feeds/${session.user.id}/${feedId}`

      // Update the feed URL
      const { error } = await supabase
        .from("podcast_feeds")
        .update({
          feed_url: newFeedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id)
        .eq("is_default", true)

      if (error) {
        throw error
      }

      setPodcastFeed(newFeedUrl)

      toast({
        title: "Feed regenerated",
        description: "Your podcast feed URL has been regenerated.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error regenerating feed",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Feed</CardTitle>
          <CardDescription>
            Add this private feed URL to your favorite podcast app to listen to your content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feed-url">Your Private Feed URL</Label>
            <div className="flex">
              <Input id="feed-url" value={podcastFeed || ""} readOnly className="flex-1" />
              <Button variant="outline" size="icon" className="ml-2" onClick={handleCopyFeed}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">How to use your feed</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Copy the feed URL above</li>
              <li>Open your favorite podcast app (Apple Podcasts, Spotify, Overcast, etc.)</li>
              <li>Look for an option to "Add by URL" or "Add RSS Feed"</li>
              <li>Paste your feed URL and save</li>
              <li>Your Speasy content will appear as a podcast</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleRegenerateFeed} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Regenerating..." : "Regenerate Feed URL"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Podcast Settings</CardTitle>
          <CardDescription>Configure how your content appears in podcast apps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feed-title">Feed Title</Label>
            <Input id="feed-title" defaultValue="My Speasy Feed" placeholder="Enter a title for your podcast feed" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feed-description">Feed Description</Label>
            <Input
              id="feed-description"
              defaultValue="Your personalized audio content feed"
              placeholder="Enter a description for your podcast feed"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
