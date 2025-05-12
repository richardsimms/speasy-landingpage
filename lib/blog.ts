import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { supabase } from "@/utils/supabase"

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

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabaseServer = createServerComponentClient({ cookies })
    const { data, error } = await supabaseServer
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })

    if (error) {
      console.error("Error fetching blog posts:", error)
      return []
    }

    return data as BlogPost[]
  } catch (e) {
    console.error("Error fetching blog posts:", e)
    return await getBlogPostsStatic()
  }
}

// Static version that doesn't rely on cookies for generateStaticParams
export async function getBlogPostsStatic(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts (static):", error)
    return []
  }

  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  try {
    const supabaseServer = createServerComponentClient({ cookies })
    const { data, error } = await supabaseServer
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (error || !data) {
      console.error("Error fetching blog post:", error)
      return await getBlogPostBySlugStatic(slug)
    }

    return data as BlogPost
  } catch (e) {
    console.error("Error fetching blog post:", e)
    return await getBlogPostBySlugStatic(slug)
  }
}

// Static version that doesn't rely on cookies
export async function getBlogPostBySlugStatic(slug: string): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error || !data) {
    console.error("Error fetching blog post (static):", error)
    notFound()
  }

  return data as BlogPost
}
