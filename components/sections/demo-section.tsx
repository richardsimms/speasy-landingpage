"use client"

import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import AudioWaveform from "@/components/audio-waveform"

interface AudioDemo {
  id: string
  newsletter: string
  topic: string
  transcript: string
}

const audioSamples: AudioDemo[] = [
  {
    id: "lennys",
    newsletter: "Lenny's Newsletter",
    topic: "Product Strategy",
    transcript:
      "Today we're exploring the three key metrics every product manager should track to ensure their product is on the right track. First, user engagement shows how valuable your product is to users on a daily basis...",
  },
  {
    id: "dense",
    newsletter: "Dense Discovery",
    topic: "Tech Trends",
    transcript:
      "This week we're looking at emerging design systems that prioritize accessibility without sacrificing aesthetics. Several new tools have emerged that make it easier for designers to validate their color choices...",
  },
  {
    id: "tldr",
    newsletter: "TLDR",
    topic: "Daily Tech Brief",
    transcript:
      "In today's tech news: Apple announced their new AI features coming to iOS 18, Google's latest algorithm update is affecting search rankings for media sites, and Tesla reported record deliveries for Q2...",
  },
]

export default function DemoSection() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({
    lennys: 0,
    dense: 0,
    tldr: 0,
  })

  const togglePlayback = (id: string) => {
    if (playingId === id) {
      setPlayingId(null)
    } else {
      setPlayingId(id)
      // Reset progress of previously playing audio
      if (playingId) {
        setProgress((prev) => ({ ...prev, [playingId]: 0 }))
      }
    }
  }

  // Simulate audio progress
  React.useEffect(() => {
    if (!playingId) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const currentProgress = prev[playingId] || 0

        if (currentProgress >= 100) {
          setPlayingId(null)
          return { ...prev, [playingId]: 0 }
        }

        return { ...prev, [playingId]: currentProgress + 2 }
      })
    }, 200)

    return () => clearInterval(interval)
  }, [playingId])

  return (
    <section className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">This is what Speasy sounds like.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Listen to samples from popular newsletters, transformed into audio.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {audioSamples.map((sample, index) => (
            <motion.div
              key={sample.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{sample.newsletter}</h3>
                    <p className="text-sm text-muted-foreground">{sample.topic}</p>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => togglePlayback(sample.id)}
                      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
                    >
                      {playingId === sample.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <AudioWaveform isPlaying={playingId === sample.id} progress={progress[sample.id] || 0} />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-muted p-3 rounded-lg h-24 overflow-hidden relative">
                      <div
                        className={`transition-transform duration-300 ${playingId === sample.id ? "animate-scroll-slow" : ""}`}
                      >
                        <p className="text-sm">{sample.transcript}</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
