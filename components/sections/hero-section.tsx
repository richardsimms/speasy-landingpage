"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import AudioWaveform from "@/components/audio-waveform"
import { Button } from "@/components/ui/button"
import { redirectToStripeCheckout } from "@/utils/stripe"
import Image from "next/image"
import useSWR from 'swr';
import CountUp from 'react-countup';

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const DEFAULT_DURATION = 120 // 2 minutes in seconds
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle start listening button click
  const handleStartListening = async () => {
    try {
      await redirectToStripeCheckout();
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
    }
  }

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    // Add debugging
    console.log("Formatting time for seconds:", seconds);
    
    if (isNaN(seconds) || !isFinite(seconds)) {
      console.warn("Invalid seconds value:", seconds);
      return "0:00";
    }
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' + secs : secs}`
  }

  // Update audio progress
  const updateProgress = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current
      setCurrentTime(currentTime)
      setAudioProgress((currentTime / duration) * 100)
    }
  }

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error } = useSWR('/api/stats/articles-converted', fetcher, { refreshInterval: 300000 });
  const liveCount = data && typeof data.count === 'number' ? data.count : 1000;
  const isApiError = !!error || (data && data.count == null);

  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-8">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none">
              Turn newsletters into <span className="text-primary">Podcast.</span> -Listen, don't read. 
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-xl">
              Speasy instantly converts your favourite newsletters into short, high-quality audio summaries. No setup, no clutter-just subscribe, press play, and catch up on the go.
              </p>
            </motion.div>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row vertical-center">
                <Button
                  size="lg"
                  variant="default"
                  type="button"
                  onClick={handleStartListening}
                >
                  Start listening - $5/month
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Over <span className="text-primary font-bold">
                    {isApiError ? '1,123' : <CountUp end={liveCount} duration={1.2} separator="," />}
                  </span> articles turned into audio this month
                </p> 
              </div>
            </motion.div>
          </div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-full max-w-[400px] aspect-[9/16] mx-auto bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
              {/* Audio element - hidden but functional */}
              <audio 
                ref={audioRef}
                src="/optimized/audio/hero-audio.mp3"
                onTimeUpdate={updateProgress}
                onLoadedMetadata={(e) => {
                  if (audioRef.current) {
                    const audioDuration = audioRef.current.duration;
                    console.log("Audio duration loaded:", audioDuration);
                    if (!isNaN(audioDuration) && isFinite(audioDuration) && audioDuration > 0) {
                      setDuration(audioDuration);
                    } else {
                      // If we can't get a valid duration, use the default
                      setDuration(DEFAULT_DURATION);
                    }
                    setIsLoading(false);
                  }
                }}
                onError={(e) => {
                  console.error("Audio loading error:", e);
                  setDuration(DEFAULT_DURATION);
                  setIsLoading(false);
                }}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />
              
              {/* Phone mockup with audio player */}
              <div className="absolute inset-0 flex flex-col">
                {/* Phone status bar */}
                <div className="h-6 mt-4 bg-background/90 flex items-center justify-between px-4">
                  <div className="text-xs">9:41</div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                        <path d="M18 14.26V10c0-3.09-2.46-5.6-5.5-5.6S7 6.91 7 10v4.26l-2 2V18h16v-1.74l-2-2zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
                      </svg>
                    </div>
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                        <path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z" />
                      </svg>
                    </div>
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* App header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                      <span className="font-medium">Podcast app</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Audio player */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">Speasy</h3>
                    <p className="text-sm text-muted-foreground">What it is • 2 min summary</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src="/optimized/podcast-cover.webp"
                        alt="Speasy Podcast Cover"
                        fill
                        className="object-cover"
                        priority
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center">
                        <button
                          onClick={togglePlayback}
                          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground transform hover:scale-105 transition-transform"
                          aria-label={isPlaying ? "Pause audio" : "Play audio"}
                        >
                          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="h-10">
                      <AudioWaveform isPlaying={isPlaying} progress={audioProgress} />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <span>{isLoading ? "2:00" : formatTime(duration)}</span>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Transcript</p>
                      <div className="mt-2 text-sm text-muted-foreground h-20 overflow-hidden relative">
                        <div className={`transition-transform duration-900 ${isPlaying ? "animate-scroll-slow" : ""}`}>
                          <p className="mb-2">
                            Feeling buried under unread newsletters? You're not alone.
                          </p>
                          <p className="mb-2">
                            Your inbox is full of content you want to read—industry trends, thought leadership, AI breakthroughs. But life moves fast. Between back-to-back meetings, commutes, and trying to switch off—you just don't have time to read everything.
                          </p>
                          <p className="mb-2">
                            Enter Speasy—a personal podcast feed that turns top curated newsletters into high-quality audio you can actually keep up with.
                          </p>
                          <p className="mb-2">
                            Instead of scanning headlines or letting articles pile up unread, Speasy delivers clear, professional audio summaries straight to your favorite podcast app. No extra screens, no extra guilt. Just listen and go.
                          </p>
                          <p className="mb-2">
                            Here's how it works:
                          </p>
                          <ul className="mb-2 list-disc list-inside space-y-1">
                            <li>
                              Step one—Sign up for just $5 a month.
                            </li>
                            <li>
                              Step two—Choose from curated categories like Tech, Design, Business, and AI.
                            </li>
                            <li>
                              Step three—Start listening. In Speasy, or in Apple Podcasts, Spotify, Overcast—whatever app you already use.
                            </li>
                          </ul>
                          <p className="mb-2">
                            Every episode is a distilled summary of expert newsletters—handpicked and spoken aloud with premium AI voice tech. It sounds human. It feels effortless.
                          </p>
                          <p className="mb-2">
                            Whether you're commuting, walking, doing dishes, or taking a break—Speasy helps you stay sharp, inspired, and in the loop. No more screen fatigue. No more inbox overwhelm. Just great content, flowing into your day.
                          </p>
                          <p className="mb-2">
                            If you're someone who loves to learn but hates falling behind, Speasy was made for you.
                          </p>
                          <p className="mb-2">
                            Start listening today. $5 a month. Zero noise. All signal.
                          </p>
                          <p className="mb-2">
                            Speasy—Reclaim your time. Rewrite your story.
                          </p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
