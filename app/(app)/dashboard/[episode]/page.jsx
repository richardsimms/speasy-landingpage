import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { EpisodePlayButton } from '@/components/EpisodePlayButton'
import { FormattedDate } from '@/components/FormattedDate'
import { PauseIcon } from '@/components/PauseIcon'
import { PlayIcon } from '@/components/PlayIcon'
import { getAllEpisodes } from '@/lib/episodes'

const getEpisode = cache(async (id) => {
  let allEpisodes = await getAllEpisodes()
  let episode = allEpisodes.find((episode) => episode.id.toString() === id)

  if (!episode) {
    notFound()
  }

  return episode
})

export async function generateMetadata({ params }) {
  let episode = await getEpisode(params.episode)

  return {
    title: episode.title,
  }
}

export default async function Episode({ params }) {
  let episode = await getEpisode(params.episode)
  let date = new Date(episode.published)

  return (
    <article className="py-16 lg:py-36">
      <Container>
        <header className="flex flex-col">
          <div className="gap-6">
            <EpisodePlayButton
              episode={episode}
              className="group relative flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-full bg-primary hover:bg-primary/90 focus:outline-none focus:ring focus:ring-primary focus:ring-offset-4"
              playing={
                <PauseIcon className="h-9 w-9 fill-primary-foreground group-active:fill-primary-foreground/80" />
              }
              paused={
                <PlayIcon className="h-9 w-9 fill-primary-foreground group-active:fill-primary-foreground/80" />
              }
            />
            <div className="flex flex-col">
              <h1 className="mt-2 text-4xl font-bold text-foreground">
                {episode.title}
              </h1>
              <div className="order-first flex items-center justify-between">
                <FormattedDate
                  date={date}
                  className="font-mono text-sm leading-7 text-muted-foreground"
                />
                <Link 
                  href="/"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
                  aria-label="Close" 
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <p className="ml-24 mt-3 text-lg font-medium leading-8 text-muted-foreground">
            {episode.description}
          </p>
        </header>
        <hr className="my-12 border-border" />
        <div
          className="prose prose-slate dark:prose-invert mt-14 [&>h2:nth-of-type(3n)]:before:bg-violet-200 dark:[&>h2:nth-of-type(3n)]:before:bg-violet-800 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 dark:[&>h2:nth-of-type(3n+2)]:before:bg-indigo-800 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-foreground [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-primary/20 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: episode.content }}
        />
      </Container>
    </article>
  )
}
