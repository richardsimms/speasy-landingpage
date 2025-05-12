import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

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
  const supabase = createServerComponentClient({ cookies })
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
  const supabase = createServerComponentClient({ cookies })
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
