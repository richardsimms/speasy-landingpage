import { PageHeader } from "@/components/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "FAQ - Speasy",
  description: "Frequently asked questions about Speasy",
}

export default function FAQPage() {
  return (
    <>
      <PageHeader
        title="Frequently asked questions"
        description="Find answers to common questions about Speasy and how it works."
      />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Speasy?</AccordionTrigger>
                <AccordionContent>
                  Speasy is a service that turns newsletters and email content into audio summaries. We help busy
                  professionals stay informed without having to read through dozens of emails and newsletters.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does Speasy work?</AccordionTrigger>
                <AccordionContent>
                  Speasy uses advanced AI to analyze newsletters and emails, extract the most important information, and
                  convert it into concise audio summaries. These summaries are delivered to you through a private
                  podcast feed that you can access in your favorite podcast app.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What newsletters does Speasy support?</AccordionTrigger>
                <AccordionContent>
                  Our free plan includes summaries of popular newsletters across tech, business, productivity, and
                  design. Some examples include Lenny's Newsletter, Dense Discovery, TLDR, The Hustle, and more. We're
                  constantly adding new newsletters to our library.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I listen to Speasy summaries?</AccordionTrigger>
                <AccordionContent>
                  When you sign up for Speasy, you'll receive a private podcast feed that you can add to any podcast app
                  (like Apple Podcasts, Spotify, Pocket Casts, etc.). New summaries will automatically appear in your
                  feed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>What's the difference between the free and pro plans?</AccordionTrigger>
                <AccordionContent>
                  The free plan gives you access to our curated selection of popular newsletters. The pro plan adds the
                  ability to connect your email inbox, so we can summarize your personal newsletter subscriptions and
                  other important emails.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Is my email data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, we take security and privacy very seriously. We only access the emails you explicitly allow us
                  to, we never store your full emails, and we use industry-standard encryption and security practices.
                  You can revoke access at any time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger>How long are the audio summaries?</AccordionTrigger>
                <AccordionContent>
                  Most summaries are between 2-5 minutes long, depending on the length and complexity of the original
                  content. Our goal is to give you the key insights in the most efficient way possible.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger>Can I customize which newsletters get summarized?</AccordionTrigger>
                <AccordionContent>
                  Yes, Pro plan users can set up filters and rules to determine which emails get summarized. You can
                  include or exclude specific senders, subjects, or domains.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
