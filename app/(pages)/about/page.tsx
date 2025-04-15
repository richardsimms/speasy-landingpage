import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "About - Speasy",
  description: "Learn about Speasy and our mission to make information consumption easier",
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Speasy"
        description="We're on a mission to help busy professionals stay informed without drowning in content."
      />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Our story</h2>
              <p className="text-muted-foreground">
                Speasy was born out of frustration. As professionals in the tech industry, we found ourselves
                subscribing to dozens of newsletters to stay informed. But the reality was that most of them went
                unread, buried in our inboxes.
              </p>
              <p className="text-muted-foreground">
                We realized that the problem wasn't the content—it was the format. Reading takes focus and dedicated
                screen time, which is increasingly scarce. But we all have moments in our day—commuting, walking, doing
                chores—where we could be learning if the content was in audio form.
              </p>
              <p className="text-muted-foreground">
                That's why we created Speasy: to transform valuable written content into audio that fits into your life.
                No more guilt about unread newsletters. No more missing out on insights that could help your career or
                business.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Our mission</h2>
              <p className="text-muted-foreground">
                We believe that staying informed shouldn't be a full-time job. Our mission is to make knowledge
                consumption effortless, allowing busy professionals to absorb insights and stay up-to-date without
                sacrificing their time or attention.
              </p>
              <p className="text-muted-foreground">
                We're committed to building tools that respect your time, attention, and privacy, while delivering
                genuine value through thoughtful curation and summarization.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Our team</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-square overflow-hidden rounded-full w-24 h-24 mx-auto mb-4">
                      <Image
                        src="/placeholder.svg?height=96&width=96"
                        alt="Alex Chen"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-center">Alex Chen</h3>
                    <p className="text-sm text-muted-foreground text-center">Co-founder & CEO</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-square overflow-hidden rounded-full w-24 h-24 mx-auto mb-4">
                      <Image
                        src="/placeholder.svg?height=96&width=96"
                        alt="Jamie Rodriguez"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-center">Jamie Rodriguez</h3>
                    <p className="text-sm text-muted-foreground text-center">Co-founder & CTO</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
