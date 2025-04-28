"use client"

import React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import AudioWaveform from "@/components/audio-waveform"
import { Button } from "@/components/ui/button"
import { redirectToStripeCheckout } from "@/utils/stripe"

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
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
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
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
                Turn your inbox into a <span className="text-primary">Podcast.</span> Start listening today. 
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-xl">
                Speasy transforms popular newsletters into podcast-style summaries you can listen to on the go. No inbox setup required—just subscribe, press play, and reclaim your time.
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
                  Over <span className="text-primary font-bold">1,000</span> articles turned into audio this month
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
                src="/audio/ElevenLabs_2025-04-28_LennyNewsletter.mp3"
                onTimeUpdate={updateProgress}
                onLoadedMetadata={(e) => {
                  if (audioRef.current) {
                    const audioDuration = audioRef.current.duration;
                    console.log("Audio duration loaded:", audioDuration);
                    setDuration(audioDuration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />
              
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
                    <p className="text-sm text-muted-foreground">Product Strategy • 2 min summary</p>
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
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Transcript</p>
                      <div className="mt-2 text-sm text-muted-foreground h-20 overflow-hidden relative">
                        <div className={`transition-transform duration-300 ${isPlaying ? "animate-scroll-slow" : ""}`}>
                          <p className="mb-2">
                            Get ready to unlock the secrets behind one of the most inspiring transformations in tech.
                          </p>
                          <p className="mb-2">
                            Today, we dive into the story of monday.com — and how they turned a hard reality check into a rocket ship to $1 billion in annual revenue.
                          </p>
                          <p className="mb-2">
                            Here's why this matters:
                          </p>
                          <p className="mb-2">
                            monday.com wasn't always a market leader. In fact, they realised they were getting outpaced by competitors. But instead of crumbling, they reinvented everything — and what they learned could change the way you think about product, leadership, and ambition.
                          </p>
                          <p className="mb-2">
                            Get ready to rethink what's possible:
                          </p>
                          <ul className="mb-2 list-disc list-inside space-y-1">
                            <li>
                              You'll see how setting "impossible" goals — like launching 25 features in just one month — shattered old limits and sparked creative breakthroughs.
                            </li>
                            <li>
                              You'll hear how radical transparency — real-time metrics shared with every employee, even during job interviews — built a company culture wired for ownership and alignment.
                            </li>
                            <li>
                              You'll discover why focusing on impact over output unlocked bigger growth than shipping faster ever could.
                            </li>
                          </ul>
                          <p className="mb-2">
                            The real game changer?
                          </p>
                          <p className="mb-2">
                            monday.com didn't just iterate — they reimagined their whole market position, launching five products at once and capturing a massive new audience.
                          </p>
                          <p className="mb-2">
                            They used tight, timeboxed sprints — what they call "traps" — to stay fast, focused, and fearless.
                          </p>
                          <p className="mb-2">
                            And beneath all the business tactics, there's a deeper lesson:
                          </p>
                          <p className="mb-2">
                            Daniel Lereya, their Chief Product and Technology Officer, shares how embracing self-doubt, navigating impostor syndrome, and learning to delegate helped him scale himself as a leader, not just the company.
                          </p>
                          <p className="mb-2">
                            The exciting idea?
                          </p>
                          <p className="mb-2">
                            When you combine radical transparency, audacious goals, and impact-driven thinking, you don't just build products — you build momentum, resilience, and a culture where the impossible starts to feel normal.
                          </p>
                          <p className="mb-2">
                            So if you're ready to level up your thinking and lead with boldness, take a page from monday.com's playbook — and start turning your biggest challenges into your greatest opportunities.
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
