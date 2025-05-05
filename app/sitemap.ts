import { MetadataRoute } from 'next'
import { supabase } from '@/utils/supabase'

interface BlogPost {
  slug: string
  updated_at: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://speasy.app'

  // Static routes - only include pages that actually exist
  const staticRoutes = [
    '',
    '/blog',
    '/faq',
    "/privacy-policy",
    "/terms-of-service",
    '/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Get blog posts from Supabase
  const blogPosts = await fetchBlogPosts()
  console.log('Blog posts for sitemap:', blogPosts) // Debug log

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }

    console.log('Fetched posts:', posts) // Debug log
    return posts || []
  } catch (e) {
    console.error('Exception in fetchBlogPosts:', e)
    return []
  }
} 