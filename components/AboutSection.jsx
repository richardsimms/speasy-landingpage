'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { TinyWaveFormIcon } from '@/components/TinyWaveFormIcon'

export function AboutSection(props) {
  let [isExpanded, setIsExpanded] = useState(false)

  return (
    <section {...props}>
      <h2 className="flex items-center font-mono text-sm font-medium leading-7 text-foreground">
        <TinyWaveFormIcon
          colors={['fill-primary/30', 'fill-primary/60']}
          className="h-2.5 w-2.5"
        />
        <span className="ml-2.5">About</span>
      </h2>
      <p
        className={clsx(
          'mt-2 text-base leading-7 text-muted-foreground',
          !isExpanded && 'lg:line-clamp-4',
        )}
      >
        You're subscribed to [category] newsletters. But you never read them. Time is short, attention is split, and that "save to read later" list only gets longer.
      </p>
      {!isExpanded && (
        <button
          type="button"
          className="mt-2 hidden text-sm font-bold leading-6 text-primary hover:text-primary/80 active:text-primary/70 lg:inline-block"
          onClick={() => setIsExpanded(true)}
        >
          Show more
        </button>
      )}
    </section>
  )
}
