'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { useAudioPlayer } from '@/components/AudioProvider'
import { ForwardButton } from '@/components/player/ForwardButton'
import { MuteButton } from '@/components/player/MuteButton'
import { PlaybackRateButton } from '@/components/player/PlaybackRateButton'
import { PlayButton } from '@/components/player/PlayButton'
import { RewindButton } from '@/components/player/RewindButton'
import { Slider } from '@/components/player/Slider'

function parseTime(seconds) {
  let hours = Math.floor(seconds / 3600)
  let minutes = Math.floor((seconds - hours * 3600) / 60)
  seconds = seconds - hours * 3600 - minutes * 60
  return [hours, minutes, seconds]
}

function formatHumanTime(seconds) {
  let [h, m, s] = parseTime(seconds)
  return `${h} hour${h === 1 ? '' : 's'}, ${m} minute${
    m === 1 ? '' : 's'
  }, ${s} second${s === 1 ? '' : 's'}`
}

export function AudioPlayer() {
  let player = useAudioPlayer()

  let wasPlayingRef = useRef(false)

  let [currentTime, setCurrentTime] = useState(player.currentTime)

  useEffect(() => {
    setCurrentTime(null)
  }, [player.currentTime])

  if (!player.episode) {
    return null
  }

  return (
    <div className="flex items-center justify-centre gap-6 bg-background/90 px-4 py-4 ring-2 ring-border rounded-lg backdrop-blur-lg ">
      <div className="hidden md:block">
        <PlayButton player={player} />
      </div>
      <div className="mb-[env(safe-area-inset-bottom)] flex flex-1 flex-col gap-3 overflow-hidden p-1">
        <Link
          href={`/${player.episode.id}`}
          className="truncate text-center text-sm font-bold leading-6 md:text-left"
          title={player.episode.title}
        >
          {player.episode.title}
        </Link>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full">
          <div className="order-1 md:order-none w-full md:flex-1 flex items-center">
            <Slider
              label="Current time"
              maxValue={player.duration}
              step={1}
              value={[currentTime ?? player.currentTime]}
              onChange={([value]) => setCurrentTime(value)}
              onChangeEnd={([value]) => {
                player.seek(value)
                if (wasPlayingRef.current) {
                  player.play()
                }
              }}
              onChangeStart={() => {
                wasPlayingRef.current = player.playing
                player.pause()
              }}
              numberFormatter={{ format: formatHumanTime }}
            />
          </div>
          <div className="flex flex-none items-center gap-4 order-3 md:order-none w-full md:w-auto justify-between md:justify-normal">
            <MuteButton player={player} />
            <RewindButton player={player} />
            <div className="md:hidden">
              <PlayButton player={player} />
            </div>
            <ForwardButton player={player} />
            <PlaybackRateButton player={player} />
          </div>
        </div>
      </div>
    </div>
  )
}
