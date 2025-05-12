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
  try {
    // Handle build time specially to return mock data immediately
    if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
      return MOCK_BLOG_POSTS;
    }
    
    // Ensure we're not in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('Running in test environment, returning mock data');
      return MOCK_BLOG_POSTS;
    }
    
    const supabase = await createServerSafeClient();
    
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.error("No blog posts data returned or data is not an array");
      return [];
    }

    return data as BlogPost[];
  } catch (error) {
    console.error("Exception fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  try {
    // Handle build time specially to return mock data immediately
    if (process.env.NEXT_PUBLIC_BUILD_MODE === 'true') {
      const post = MOCK_BLOG_POSTS.find(post => post.slug === slug) || MOCK_BLOG_POSTS[0];
      return post;
    }
    
    // Ensure we're not in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('Running in test environment, returning mock data');
      const post = MOCK_BLOG_POSTS.find(post => post.slug === slug) || MOCK_BLOG_POSTS[0];
      return post;
    }
    
    const supabase = await createServerSafeClient();
    
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error(`Error fetching blog post with slug "${slug}":`, error);
      notFound();
    }

    if (!data) {
      console.error(`Blog post with slug "${slug}" not found`);
      notFound();
    }

    return data as BlogPost;
  } catch (error) {
    console.error(`Exception fetching blog post with slug "${slug}":`, error);
    notFound();
  }
}
