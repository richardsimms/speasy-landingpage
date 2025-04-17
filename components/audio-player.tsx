"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Rewind,
  FastForward,
  Bookmark,
  BookmarkCheck,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { saveContentItem, markContentAsRead } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { formatDuration } from "@/lib/utils"

interface ContentItem {
  id: string
  title: string
  url: string
  content?: string
  summary?: string
  published_at: string
  source?: {
    name: string
    category_id?: string
  }
  audio?: {
    file_url: string
    duration: number
    type: string
  }[]
}

interface AudioPlayerProps {
  contentItem: ContentItem
  relatedContent: ContentItem[]
}

export function AudioPlayer({ contentItem, relatedContent }: AudioPlayerProps) {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Get the audio file URL
  const audioUrl =
    contentItem.audio && contentItem.audio.length > 0
      ? contentItem.audio[0].file_url
      : "https://example.com/sample-audio.mp3" // Placeholder for demo

  useEffect(() => {
    // Mark as read when the player loads
    markContentAsRead(contentItem.id)

    // Reset player state when content changes
    setIsPlaying(false)
    setCurrentTime(0)

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.load()
    }
  }, [contentItem.id])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 30
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10
    }
  }

  const handleSave = async () => {
    const result = await saveContentItem(contentItem.id)

    if (result.success) {
      setIsSaved(true)
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: contentItem.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard.",
      })
    }
  }

  const playNextContent = (id: string) => {
    router.push(`/player?id=${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{contentItem.title}</CardTitle>
          <CardDescription>
            {contentItem.source?.name && <span className="mr-2">{contentItem.source.name}</span>}
            {contentItem.published_at && <span>{new Date(contentItem.published_at).toLocaleDateString()}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* Player controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{formatDuration(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="mx-4 flex-1"
              />
              <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" onClick={skipBackward}>
                <Rewind className="h-5 w-5" />
                <span className="sr-only">Rewind 10 seconds</span>
              </Button>
              <Button variant="ghost" size="icon" disabled>
                <SkipBack className="h-5 w-5" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button variant="default" size="icon" className="h-12 w-12 rounded-full" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </Button>
              <Button variant="ghost" size="icon" disabled>
                <SkipForward className="h-5 w-5" />
                <span className="sr-only">Next</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={skipForward}>
                <FastForward className="h-5 w-5" />
                <span className="sr-only">Forward 30 seconds</span>
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaved}>
                  {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Content summary */}
          {contentItem.summary && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-muted-foreground">{contentItem.summary}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={contentItem.url} target="_blank" rel="noopener noreferrer">
              View Original Content
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Related content */}
      {relatedContent.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Related Content</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedContent.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => playNextContent(item.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
