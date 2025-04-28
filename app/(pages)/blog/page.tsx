import { PageHeader } from "@/components/page-header"
import { getBlogPosts } from "@/lib/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Blog - Speasy",
  description: "Latest news, updates, and insights from the Speasy team",
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <>
      <PageHeader
        title="Release notes & updates"
        description="Stay up to date with the latest features, improvements, and news from Speasy."
      />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            {posts.length > 0 ? (
              <div className="grid gap-8">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{post.category}</Badge>
                        <time className="text-sm text-muted-foreground">{formatDate(post.published_at)}</time>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <CardTitle className="text-2xl hover:text-primary transition-colors">{post.title}</CardTitle>
                      </Link>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-4">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-secondary-foreground hover:underline inline-flex items-center"
                        >
                          Read more
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
                            className="ml-1 h-4 w-4"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No posts found</h3>
                <p className="text-muted-foreground mt-2">Check back soon for updates!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
