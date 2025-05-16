"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bookmark, BookmarkCheck, Play, Clock, CheckCircle, CircleSlash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { saveContentItem, markContentAsRead, markContentAsUnread } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { formatDuration } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  is_read?: boolean
}

interface ContentListProps {
  items: ContentItem[]
  emptyMessage?: string
}

export function ContentList({ items, emptyMessage = "No content available." }: ContentListProps) {
  const [savedItems, setSavedItems] = useState<string[]>([])
  const [readItems, setReadItems] = useState<string[]>([])
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all")
  
  // Initialize read status from props
  useEffect(() => {
    const initialReadItems = items
      .filter(item => item.is_read)
      .map(item => item.id)
    setReadItems(initialReadItems)
  }, [items])

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

  const handleToggleReadStatus = async (id: string) => {
    const isCurrentlyRead = readItems.includes(id)
    
    if (isCurrentlyRead) {
      const result = await markContentAsUnread(id)
      if (result.success) {
        setReadItems(prev => prev.filter(itemId => itemId !== id))
        toast({
          title: "Marked as unread",
          description: "The content has been marked as unread.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error updating status",
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    } else {
      const result = await markContentAsRead(id)
      if (result.success) {
        setReadItems(prev => [...prev, id])
        toast({
          title: "Marked as read",
          description: "The content has been marked as read.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error updating status",
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    }
  }

  // Auto-mark as read when opening the player
  const handleOpenPlayer = async (id: string) => {
    if (!readItems.includes(id)) {
      const result = await markContentAsRead(id)
      if (result.success) {
        setReadItems(prev => [...prev, id])
      }
    }
  }

  // Filter items based on the selected filter
  const filteredItems = items.filter(item => {
    const isRead = readItems.includes(item.id) || item.is_read
    
    if (filter === "read") return isRead
    if (filter === "unread") return !isRead
    return true
  })

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
      <div className="mb-4">
        <Tabs
          defaultValue="all"
          value={filter}
          onValueChange={(value) => setFilter(value as "all" | "read" | "unread")}
          className="w-full"
        >
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No content</CardTitle>
            <CardDescription>
              {filter === "read" 
                ? "You don't have any read content yet." 
                : filter === "unread" 
                  ? "You don't have any unread content." 
                  : emptyMessage}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        filteredItems.map((item) => {
          const isRead = readItems.includes(item.id) || item.is_read
          
          return (
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
                  <div className="flex items-center gap-2">
                    {isRead && (
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Read
                      </Badge>
                    )}
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
                    onClick={() => handleToggleReadStatus(item.id)}
                  >
                    {isRead ? (
                      <>
                        <CircleSlash className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Mark Unread</span>
                        <span className="md:hidden">Unread</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Mark Read</span>
                        <span className="md:hidden">Read</span>
                      </>
                    )}
                  </Button>
                </div>
                <Button 
                  asChild 
                  className="w-full md:w-auto"
                >
                  <Link href={`/player?id=${item.id}`} onClick={() => handleOpenPlayer(item.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Listen
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })
      )}
    </div>
  )
}
