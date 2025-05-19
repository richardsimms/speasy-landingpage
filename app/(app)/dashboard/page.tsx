import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from 'next/link'

import { Container } from '@/components/Container'
import { EpisodePlayButton } from '@/components/EpisodePlayButton'
import { FormattedDate } from '@/components/FormattedDate'
import { DashboardClient } from "@/components/dashboard-client"

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function PauseIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.496 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H2.68a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H1.496Zm5.82 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H8.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7.316Z"
      />
    </svg>
  )
}

function PlayIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" {...props}>
      <path d="M8.25 4.567a.5.5 0 0 1 0 .866l-7.5 4.33A.5.5 0 0 1 0 9.33V.67A.5.5 0 0 1 .75.237l7.5 4.33Z" />
    </svg>
  )
}

interface ContentItem {
  id: string;
  title: string;
  published_at: string;
  description?: string;
  summary?: string;
  audio?: Array<{
    file_url: string;
    duration: number;
    type: string;
  }>;
}

function ContentEntry({ content }: { content: ContentItem }) {
  let date = new Date(content.published_at)

  return (
    <article
      aria-labelledby={`content-${content.id}-title`}
      className="py-10 sm:py-12"
    >
      <Container className="">
        <div className="flex flex-col items-start">
          <h2
            id={`content-${content.id}-title`}
            className="mt-2 text-lg font-bold text-foreground"
          >
            <Link href={`/content/${content.id}`}>{content.title}</Link>
          </h2>
          <FormattedDate
            date={date}
            className="order-first font-mono text-sm leading-7 text-muted-foreground"
          />
          <p className="mt-1 text-base leading-7 text-muted-foreground">
            {content.description || content.summary}
          </p>
          <div className="mt-4 flex items-center gap-4">
            {content.audio && content.audio.length > 0 && (
              <>
                <EpisodePlayButton
                  episode={content}
                  className="flex items-center gap-x-3 text-sm font-bold leading-6 text-primary hover:text-primary/80 active:text-primary/60"
                  playing={
                    <>
                      <PauseIcon className="h-2.5 w-2.5 fill-current" />
                      <span aria-hidden="true">Listen</span>
                    </>
                  }
                  paused={
                    <>
                      <PlayIcon className="h-2.5 w-2.5 fill-current" />
                      <span aria-hidden="true">Listen</span>
                    </>
                  }
                />
                <span
                  aria-hidden="true"
                  className="text-sm font-bold text-slate-400"
                >
                  /
                </span>
              </>
            )}
            <Link
              href={`/content/${content.id}`}
              className="flex items-center text-sm font-bold leading-6 text-primary hover:text-primary/80 active:text-primary/60"
              aria-label={`Show details for ${content.title}`}
            >
              View details
            </Link>
          </div>
        </div>
      </Container>
    </article>
  )
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get authenticated user using the recommended getUser method
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Authentication error:", userError)
    return null
  }

  // Get user's subscribed categories
  const { data: subscriptions } = await supabase
    .from("user_category_subscriptions")
    .select("category_id")
    .eq("user_id", user.id)

  const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || []
  
  console.log("User subscribed to categories:", subscribedCategoryIds)

  let latestContent: any[] = []

  if (subscribedCategoryIds.length > 0) {
    // Get content from sources that match the user's subscribed categories
    const { data: contentItems, error: contentError } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources!inner(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      `)
      .eq("user_content_items.user_id", user.id)
      .in("source.category_id", subscribedCategoryIds)
      .order("published_at", { ascending: false })
      .limit(10)
    
    console.log("Content items error:", contentError)
    
    if (contentItems && contentItems.length > 0) {
      latestContent = contentItems
      console.log("Found filtered content items:", contentItems.length)
    } else {
      console.log("No content found for subscribed categories")
    }
  } else {
    console.log("No subscribed categories")
  }
  
  // If no content was found through categories, show all content
  if (latestContent.length === 0) {
    console.log("Falling back to all content")
    const { data: allContent } = await supabase
      .from("content_items")
      .select(`
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      `)
      .eq("user_content_items.user_id", user.id)
      .order("published_at", { ascending: false })
      .limit(10)
    
    if (allContent) {
      latestContent = allContent
    }
  }

  // Get user's saved content
  const { data: savedContent } = await supabase
    .from("user_content_items")
    .select(`
      *,
      content:content_items(
        *,
        source:content_sources(name, category_id),
        audio:audio_files(file_url, duration, type),
        user_content_items!left(is_read, is_favorite)
      )
    `)
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's submitted URLs
  const { data: submittedUrls } = await supabase
    .from("user_submitted_urls")
    .select(`
      id, title, url, published_at,
      source:content_sources(name),
      audio:audio_files(file_url, duration),
      content_item_id
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  // Either use the DashboardClient component or render content directly
  if (subscribedCategoryIds && subscribedCategoryIds.length > 0) {
    return (
      <div className="pb-12 sm:pb-4 lg:pt-12">
        <Container className="pt-16">
          <h1 className="text-2xl font-bold leading-7 text-foreground">
            Your Content
          </h1>
        </Container>
        <div className="divide-y w-full auto-cols-auto divide-secondary sm:mt-4 lg:mt-8 lg:border-t lg:border-secondary">
          {latestContent.map((content) => (
            <ContentEntry key={content.id} content={content} />
          ))}
        </div>
      </div>
    )
  } else {
    // Use the dashboard client component for onboarding
    return (
      <DashboardClient
        userName={user.email?.split("@")[0] || "User"}
        userId={user.id}
        latestContent={latestContent || []}
        savedContent={savedContent?.map((item) => item.content) || []}
        submittedUrls={submittedUrls || []}
        categories={categories || []}
        subscribedCategoryIds={subscribedCategoryIds}
        isOnboarding={!subscribedCategoryIds || subscribedCategoryIds.length === 0}
      />
    )
  }
}

export const revalidate = 10
