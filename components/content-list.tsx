"use client"

import { useState } from "react"
import Link from "next/link"
import { Bookmark, BookmarkCheck, Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { saveContentItem, markContentAsRead } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { formatDuration } from "@/lib/utils"

interface ContentItem {
  id: string
  title: string
  url: string
  published_at: string
  source?: {
    name: string
    category_id: string
  }
  audio?: {
    file_url: string
    duration: number
    type: string
  }[]
}

interface ContentListProps {
  items: ContentItem[]
  emptyMessage?: string
}

export function ContentList({ items, emptyMessage = "No content available." }: ContentListProps) {
  const [savedItems, setSavedItems] = useState<string[]>([])

  const handleSave = async (id: string) => {
    const result = await saveContentItem(id)

    if (result.success) {
      setSavedItems((prev) => [...prev, id])
      toast({
        title: "Content saved",
        description: "The content has been added to your saved items.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error saving content",
        description: result.error || "Something went wrong. Please try again.",
      })
    }
  }

  const handleMarkAsRead = async (id: string) => {
    const result = await markContentAsRead(id)

    if (result.success) {
      toast({
        title: "Marked as read",
        description: "The content has been marked as read.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error marking as read",
        description: result.error || "Something went wrong. Please try again.",
      })
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No content</CardTitle>
          <CardDescription>{emptyMessage}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>
                  {item.source?.name && <span className="mr-2">{item.source.name}</span>}
                  {item.published_at && <span>{new Date(item.published_at).toLocaleDateString()}</span>}
                </CardDescription>
              </div>
              <div>
                {item.audio && item.audio.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDuration(item.audio[0].duration)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.url}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 md:flex-row md:justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
                onClick={() => handleSave(item.id)}
                disabled={savedItems.includes(item.id)}
              >
                {savedItems.includes(item.id) ? (
                  <>
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Save</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 md:flex-none"
                onClick={() => handleMarkAsRead(item.id)}
              >
                <span className="hidden md:inline">Mark as Read</span>
                <span className="md:hidden">Read</span>
              </Button>
            </div>
            <Button 
              asChild 
              className="w-full md:w-auto"
            >
              <Link href={`/player?id=${item.id}`}>
                <Play className="mr-2 h-4 w-4" />
                Listen
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
