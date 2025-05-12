import { PageHeader } from "@/components/page-header"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog"
import { formatDate } from "@/lib/utils"
import { Markdown } from "@/components/markdown"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  return {
    title: `${post.title} - Speasy Blog`,
    description: post.excerpt,
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      console.log('No blog posts found for generating static params');
      return [];
    }
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  return (
    <>
      <PageHeader title={post.title} />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-8">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="text-sm text-muted-foreground">
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                <span className="mx-2">•</span>
                <span>{post.author}</span>
              </div>
            </div>

            <Markdown content={post.content} />

            <div className="mt-12 pt-6 border-t">
              <a href="/blog" className="text-muted-foreground hover:underline inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-4 w-4"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back to all posts
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
