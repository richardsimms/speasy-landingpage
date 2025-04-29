import { MetadataRoute } from 'next'
import { supabase } from '@/utils/supabase'

interface BlogPost {
  slug: string
  updated_at: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://speasy.app'

  // Static routes
  const staticRoutes = [
    '',
    '/blog',
    '/docs',
    '/pricing',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Get blog posts from Supabase
  const blogPosts = await fetchBlogPosts()

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return posts || []
} 