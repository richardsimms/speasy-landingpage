"use client"

import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import { EarlyAccessForm } from "@/components/early-access-form"
import AudioWaveform from "@/components/audio-waveform"

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, this would control actual audio playback
  }

  // Simulate audio progress when playing
  React.useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 300)
    }

    return () => clearInterval(interval)
  }, [isPlaying])

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
                Your Newsletters. <span className="text-primary">Summarized.</span> In Your Ears.
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-xl">
                Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries. No inbox
                guilt. No more skimming. Just hit play.
              </p>
            </motion.div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <EarlyAccessForm />
              <p className="text-sm text-muted-foreground mt-2">
                Start free with curated summaries. Upgrade for your personal inbox feed.
              </p>
            </div>
          </div>

          <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <div className="relative w-full max-w-[400px] aspect-[9/16] mx-auto bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
              {/* Phone mockup with audio player */}
              <div className="absolute inset-0 flex flex-col">
                {/* Phone status bar */}
                <div className="h-6 bg-background/90 flex items-center justify-between px-4">
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
                      <span className="font-medium">Speasy</span>
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
                    <h3 className="text-xl font-bold">Lenny's Newsletter</h3>
                    <p className="text-sm text-muted-foreground">Product Strategy • 5 min summary</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <button
                      onClick={togglePlayback}
                      className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <AudioWaveform isPlaying={isPlaying} progress={audioProgress} />

                    <div className="flex justify-between text-sm">
                      <span>1:24</span>
                      <span>5:03</span>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Transcript</p>
                      <div className="mt-2 text-sm text-muted-foreground h-20 overflow-hidden relative">
                        <div className={`transition-transform duration-300 ${isPlaying ? "animate-scroll-slow" : ""}`}>
                          <p className="mb-2">
                            Today we're discussing the three key metrics every product manager should track...
                          </p>
                          <p className="mb-2">
                            First, user engagement is critical because it shows how valuable your product is to users...
                          </p>
                          <p className="mb-2">
                            Second, retention rates indicate whether your product has staying power...
                          </p>
                          <p className="mb-2">
                            And finally, conversion rate helps you understand your funnel efficiency...
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
