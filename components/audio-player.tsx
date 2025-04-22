"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
  _debug?: {
    audioUrl: string
    supabaseUrl: string
  }
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
  const [audioError, setAudioError] = useState<string | null>(null)
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Process the audio URL
  useEffect(() => {
    let url = "";
    
    if (contentItem.audio && contentItem.audio.length > 0) {
      url = contentItem.audio[0].file_url;
      
      // Quick validation
      if (!url.startsWith('http')) {
        console.error("Invalid audio URL format:", url);
        setAudioError("Invalid audio URL format. Please contact support.");
        return;
      }
      
      try {
        // Clean the URL - sometimes double encoding can cause issues
        const parsedUrl = new URL(url);
        
        // Log the URL for debugging
        console.log("Authenticated audio URL:", parsedUrl.toString());
        
        // Use the authenticated URL directly
        setProcessedAudioUrl(url);
        
        if (url.includes('token=')) {
          console.log("URL contains authentication token - good!");
        } else {
          console.warn("URL does not contain authentication token - may not work!");
        }
        
        // Try to preload the audio to check if it's accessible
        const preloadAudio = new Audio();
        preloadAudio.crossOrigin = "anonymous";
        preloadAudio.src = url;
        
        preloadAudio.addEventListener('error', (e) => {
          console.error("Preload audio error:", e);
          console.error("Audio might not be accessible due to CORS or authentication issues");
          
          // Show more detailed error info
          if (contentItem._debug) {
            console.group("Audio Debug Info");
            console.log("Debug info:", contentItem._debug);
            console.groupEnd();
          }
        });
        
        preloadAudio.addEventListener('canplaythrough', () => {
          console.log("Audio is playable! Authentication successful.");
        });
        
      } catch (err) {
        console.error("Error parsing audio URL:", err);
        setAudioError("Error processing audio URL");
      }
    } else {
      console.warn("No audio URL available");
      setAudioError("No audio file available for this content");
    }
  }, [contentItem.audio, contentItem._debug]);

  // Get the audio file URL
  const audioUrl = processedAudioUrl || 
    (contentItem.audio && contentItem.audio.length > 0
      ? contentItem.audio[0].file_url
      : "https://example.com/sample-audio.mp3"); // Placeholder for demo

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

  // Add a retry function
  const retryAudio = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setAudioError(null);
      
      if (audioRef.current) {
        // Add a cache-busting parameter to force a fresh request
        const currentSrc = audioRef.current.src;
        const newSrc = currentSrc.includes('?') 
          ? `${currentSrc}&retry=${Date.now()}` 
          : `${currentSrc}?retry=${Date.now()}`;
        
        audioRef.current.src = newSrc;
        audioRef.current.load();
        console.log("Retrying audio playback with new URL:", newSrc);
        
        // Try to play after a short delay
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => {
                console.log("Retry successful!");
                setIsPlaying(true);
              })
              .catch(err => {
                console.error("Retry failed:", err);
                setAudioError(`Retry failed: ${err.message}`);
              });
          }
        }, 1000);
      }
    } else {
      setAudioError("Maximum retry attempts reached. Please try again later.");
    }
  }, [retryCount]);

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
            onError={(e) => {
              console.error("Audio error:", e);
              console.error("Audio URL that failed:", audioUrl);
              setAudioError("Error loading audio file. Please try again later.");
              toast({
                variant: "destructive",
                title: "Audio error",
                description: "Could not load the audio file."
              });
            }}
            crossOrigin="anonymous"
            preload="metadata"
            className="hidden"
          />

          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/20 rounded overflow-auto max-h-36">
              <details>
                <summary>Debug Info</summary>
                <p>Audio URL: {audioUrl}</p>
                <p>Has Auth Token: {audioUrl?.includes('token=') ? 'Yes' : 'No'}</p>
                {contentItem._debug && (
                  <>
                    <p>Original URL: {contentItem._debug.audioUrl}</p>
                    <p>Supabase URL: {contentItem._debug.supabaseUrl}</p>
                  </>
                )}
                {audioError && <p className="text-destructive">Error: {audioError}</p>}
              </details>
            </div>
          )}

          {/* Error message with retry button */}
          {audioError && (
            <div className="p-3 bg-destructive/15 text-destructive rounded-md mb-3">
              <div className="flex items-center justify-between">
                <p>{audioError}</p>
                {retryCount < 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={retryAudio}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
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
