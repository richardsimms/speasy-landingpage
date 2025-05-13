import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { createAdminClient } from "./server-only"
import 'server-only'

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

// Use this for client requests (when cookies are available)
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Use admin client to avoid cookie issues in development/production
    const supabase = createAdminClient()
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
  } catch (error) {
    console.error("Error in getBlogPosts:", error)
    return []
  }
}

// Use this for static site generation (where cookies aren't available)
export async function getBlogPostsForStaticGeneration(): Promise<BlogPost[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts for static generation:", error)
    return []
  }

  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  try {
    // Use admin client to avoid cookie issues in development/production
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (error || !data) {
      console.error("Error fetching blog post by slug:", error)
      notFound()
    }

    return data as BlogPost
  } catch (error) {
    console.error("Error in getBlogPostBySlug:", error)
    notFound()
  }
}
