import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { FormattedDate } from '@/components/FormattedDate'

export default async function ContentPage({ params }: { params: { id: string } }) {
  try {
    // Create the supabase client directly with the cookies function
    const supabase = createServerComponentClient({ 
      cookies
    })

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      return null
    }

    // No need to await params.id, it's a string
    const contentId = params.id

    // Get content item
    const { data: contentItem, error: contentError } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      `)
      .eq("id", contentId)
      .eq("user_content_items.user_id", user.id)
      .single()

    if (contentError || !contentItem) {
      console.error("Content fetch error:", contentError)
      notFound()
    }

    // Mark as read if not already
    if (!contentItem.user_content_items?.[0]?.is_read) {
      await supabase
        .from("user_content_items")
        .upsert({
          user_id: user.id,
          content_id: contentItem.id,
          is_read: true,
          is_favorite: contentItem.user_content_items?.[0]?.is_favorite || false
        })
    }

    let date = new Date(contentItem.published_at)

    return (
      <article className="py-16 lg:py-36">
        <Container className="">
          <header className="flex flex-col">
            <div className="flex items-center justify-between gap-6">
              <FormattedDate
                  date={date}
                  className="order-first font-mono text-sm leading-7 text-slate-500"
                />
              <Link 
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Back to dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
                </div>
              <div className="flex flex-col">
                <h1 className="mt-2 text-4xl font-bold text-foreground">
                  {contentItem.title}
                </h1>
              
                {contentItem.source && (
                  <p className="text-sm text-slate-500">
                    Source: {contentItem.source.name}
                  </p>
                )}
              
            </div>
            <p className="mt-3 text-lg font-medium leading-8 text-muted-foreground">
              {contentItem.description || contentItem.summary}
            </p>
            
            {contentItem.audio && contentItem.audio.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Listen</h2>
                <audio 
                  controls 
                  src={contentItem.audio[0].file_url}
                  className="w-full"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </header>
          <hr className="my-12 border-gray-200" />
          {contentItem.content && (
            <div
              className="prose prose-slate mt-14 [&>h2:nth-of-type(3n)]:before:bg-violet-200 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: contentItem.content }}
            />
          )}
        </Container>
      </article>
    )
  } catch (error) {
    console.error("Error in ContentPage:", error)
    return <div className="p-12 text-center">Error loading content. Please try again.</div>
  }
}

// Add the dynamic params configuration
export const dynamic = 'force-dynamic'
export const revalidate = 10 