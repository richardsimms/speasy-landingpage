import { supabase } from './supabase'

export const fetchSubscribedEpisodes = async (userId) => {
  if (!userId) {
    console.error('Invalid user ID')
    return []
  }

  try {
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('user_content_items')
      .select('content_id, is_read')
      .eq('user_id', userId)

    if (subscriptionError) throw subscriptionError

    const contentIds = subscriptions.map(item => item.content_id)
    if (contentIds.length === 0) return []

    const { data: episodes, error: episodeError } = await supabase
      .from('content_items')
      .select('*')
      .in('id', contentIds)
      .order('published_at', { ascending: false })

    if (episodeError) throw episodeError

    const subscriptionMap = new Map(
      subscriptions.map(sub => [sub.content_id, sub.is_read])
    )

    return episodes.map(episode => ({
      ...episode,
      is_read: subscriptionMap.get(episode.id) || false
    }))
  } catch (error) {
    console.error('Error fetching subscribed episodes:', error)
    return []
  }
}