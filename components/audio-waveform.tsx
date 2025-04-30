"use client"

import { useEffect, useRef } from "react"

interface AudioWaveformProps {
  isPlaying: boolean
  progress: number
}

export default function AudioWaveform({ isPlaying, progress }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Generate waveform data
    const bars = 50
    const barWidth = width / bars - 1
    const progressPoint = Math.floor(bars * (progress / 100))

    for (let i = 0; i < bars; i++) {
      // Generate random height for each bar
      const seed = ((i * 7) % 11) / 10 // Deterministic "random" for consistent shape
      const randomHeight = (0.3 + seed * 0.7) * height

      // Determine if this bar is in the "played" portion
      const isPlayed = i <= progressPoint

      // Set color based on whether it's been played
      ctx.fillStyle = isPlayed ? "hsl(var(--primary))" : "hsl(var(--secondary))"

      // Draw the bar
      const x = i * (barWidth + 1)
      const barHeight =
        isPlaying && i === progressPoint ? randomHeight * (0.8 + 0.4 * Math.sin(Date.now() / 200)) : randomHeight

      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight)
    }
  }, [isPlaying, progress])

  return <canvas ref={canvasRef} width={300} height={40} className="w-full h-10" />
}
