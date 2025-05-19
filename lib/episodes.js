import { parse as parseFeed } from 'rss-to-json'
import { array, number, object, parse, string } from 'valibot'

export async function getAllEpisodes({ userId, feedUrl }) {
  let FeedSchema = object({
    items: array(
      object({
        id: string(),
        title: string(),
        published: number(),
        description: string(),
        content: string(),
        enclosures: array(
          object({
            url: string(),
            type: string(),
            length: string(),
          }),
        ),
      }),
    ),
  })

  const feedEndpoint = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/feeds/${userId}/${feedUrl}`
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/feeds/${userId}/${feedUrl}`
    
  let feed = await parseFeed(feedEndpoint)
  let items = parse(FeedSchema, feed).items

  let episodes = items.map(
    ({ id, title, description, content, enclosures, published }) => ({
      id,
      title: title,
      published: new Date(published),
      description,
      content,
      audio: enclosures.length > 0 ? {
        src: enclosures[0].url,
        type: enclosures[0].type,
      } : null,
    }),
  )

  return episodes
}