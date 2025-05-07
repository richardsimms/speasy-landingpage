"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  Pause,
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
  description: string
  url: string
  audio?: Array<{
    file_url: string
  }>
  _debug?: {
    audioUrl: string
    supabaseUrl: string
  }
}

interface AudioPlayerProps {
  contentItem: ContentItem
  relatedContent: ContentItem[]
}

export function AudioPlayer({ contentItem, }: AudioPlayerProps) {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const audioUrl = contentItem?.audio?.[0]?.file_url

  // Function to retry loading the audio
  const retryAudio = useCallback(() => {
    if (retryCount < 3 && audioRef.current) {
      setRetryCount(prev => prev + 1)
      setAudioError(null)
      
      // Add a cache-busting parameter to force reload
      const cacheBuster = `?t=${Date.now()}`
      const urlWithCacheBuster = audioUrl?.includes('?') 
        ? `${audioUrl}&cb=${Date.now()}`
        : `${audioUrl}${cacheBuster}`
      
      if (audioRef.current) {
        audioRef.current.src = urlWithCacheBuster
        
        // Give browser a moment to register the new source
        setTimeout(() => {
          audioRef.current?.load()
          audioRef.current?.play().catch(err => {
            console.error("Error retrying audio playback:", err)
            setAudioError(`Retry ${retryCount + 1} failed: ${err.message}`)
          })
        }, 500)
      }
    } else {
      setAudioError("Maximum retry attempts reached. Please try again later.")
    }
  }, [audioUrl, retryCount])

  useEffect(() => {
    if (!audioUrl) {
      setAudioError("No audio URL available")
      return
    }

    if (!audioUrl.startsWith('http')) {
      setAudioError(`Invalid audio URL format: ${audioUrl}`)
      return
    }

    console.log("Audio URL:", audioUrl)
    
    // Reset states when URL changes
    setAudioLoaded(false)
    setAudioError(null)
    setRetryCount(0)
    
    // Preload the audio to check if it's accessible
    if (audioRef.current) {
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log("Audio can play through")
        setAudioLoaded(true)
      })
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio error:", e)
        setAudioError("Failed to load audio. The file might be unavailable or the format is not supported.")
      })
    }
  }, [audioUrl])

  useEffect(() => {
    // Mark as read when the player loads
    markContentAsRead(contentItem.id)

    // Reset player state when content changes
    setIsPlaying(false)
    setCurrentTime(0)
    setAudioError(null)

    // Debug info
    console.log("ContentItem audio:", contentItem.audio)
    console.log("Audio URL to play:", audioUrl)

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.load()
    }
  }, [contentItem.id, audioUrl])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully")
            })
            .catch(error => {
              console.error("Audio playback failed:", error)
              setAudioError(`Playback error: ${error.message}`)
              toast({
                variant: "destructive",
                title: "Audio error",
                description: "Could not play the audio file. Please try again."
              })
            })
        }
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
            {contentItem.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio element */}
          {audioUrl ? (
            <>
              {audioError ? (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  <p className="mb-2">{audioError}</p>
                  {retryCount < 3 && (
                    <button 
                      onClick={retryAudio}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Retry Audio ({retryCount}/3)
                    </button>
                  )}
                </div>
              ) : null}
              
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error("Audio error:", e)
                  console.error("Audio URL that failed:", audioUrl)
                  setAudioError("Error loading audio file. Please try again later.")
                  toast({
                    variant: "destructive",
                    title: "Audio error",
                    description: "Could not load the audio file."
                  })
                }}
                crossOrigin="anonymous"
                preload="metadata"
                className="hidden"
              />
            </>
          ) : (
            <p className="text-red-500">No audio available for this content.</p>
          )}

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

            <div className="flex items-center justify-around gap-4">
              <Button variant="ghost" size="icon" onClick={skipBackward}>
                <Rewind className="h-5 w-5" />
                <span className="sr-only">Rewind 10 seconds</span>
              </Button>
 
              <Button variant="default" size="icon" className="h-12 w-12 rounded-full" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </Button>

              <Button variant="ghost" size="icon" onClick={skipForward}>
                <FastForward className="h-5 w-5" />
                <span className="sr-only">Forward 30 seconds</span>
              </Button>
            </div>

            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-40 ml-2"
              />
            </div>

            <div className="flex items-center justify-around gap-2">
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
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={contentItem.url} target="_blank" rel="noopener noreferrer">
              View Original Content
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Related content 
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
  */}
      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && contentItem._debug && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Audio URL: {contentItem._debug.audioUrl}</p>
          <p>Supabase URL: {contentItem._debug.supabaseUrl}</p>
          <p>Retry Count: {retryCount}</p>
        </div>
      )}
    </div>
  )
}
