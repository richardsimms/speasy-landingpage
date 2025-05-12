import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { SupabaseClient } from "@supabase/supabase-js"
import { createServerSafeClient } from "./supabase-server"

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  published_at: string
  updated_at: string
  is_published: boolean
  author: string
  category: string
  image_url: string | null
}

// Sample mock blog post data for build time
const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Speasy",
    slug: "getting-started-with-speasy",
    content: "This is a sample blog post content.",
    excerpt: "Learn how to get started with Speasy",
    published_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    is_published: true,
    author: "Speasy Team",
    category: "Guides",
    image_url: null
  }
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createServerSafeClient();
  
  // Handle build time specially to return mock data immediately
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    return MOCK_BLOG_POSTS;
  }
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }

  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const supabase = createServerSafeClient();
  
  // Handle build time specially to return mock data immediately
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
    const post = MOCK_BLOG_POSTS.find(post => post.slug === slug) || MOCK_BLOG_POSTS[0];
    return post;
  }
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error || !data) {
    console.error("Error fetching blog post:", error)
    notFound()
  }

  return data as BlogPost
}
