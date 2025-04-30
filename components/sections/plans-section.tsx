"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EarlyAccessForm } from "@/components/early-access-form"
import { useRouter } from "next/navigation"
import { redirectToStripeYearlyCheckout, redirectToStripeMonthlyCheckout } from "@/utils/stripe"

export default function PlansSection() {
  const router = useRouter()

  // Handle monthly checkout button click
  const handleMonthlyCheckout = async () => {
    try {
      await redirectToStripeMonthlyCheckout();
    } catch (error) {
      console.error('Error redirecting to monthly checkout:', error);
    }
  }

  // Handle yearly checkout button click
  const handleYearlyCheckout = async () => {
    try {
      await redirectToStripeYearlyCheckout();
    } catch (error) {
      console.error('Error redirecting to yearly checkout:', error);
    }
  }

  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-background overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Want your own inbox to work like this?</h2>
          <p className="mt-4 text-lg text-muted-foreground">Start with curated. Upgrade to personal.</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Start listening ($5/mo)</CardTitle>
                <CardDescription>Get started with curated content</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Access to top curated newsletter summaries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Categories: Tech, Design, Business, AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Private podcast feed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Listen in any podcast app</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <div className="w-full flex flex-col sm:flex-row gap-4 justify-left pt-4">
                  <Button
                    size="lg"
                    variant="default"
                    type="button"
                    onClick={handleMonthlyCheckout}
                    className="w-full sm:w-auto whitespace-normal"
                  >
                    Start listening - $5/month
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    type="button"
                    onClick={handleYearlyCheckout}
                    className="w-full sm:w-auto whitespace-normal"
                  >
                    $45/year
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full flex flex-col border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle>Pro Plan</CardTitle>
                    <CardDescription>Personalized for your inbox</CardDescription>
                  </div>
                  <div className="bg-primary/50 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Coming Soon
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Connect Gmail or Outlook</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Summarized feed from your own newsletters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Filter by topic, tags, tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Smart playlist: "Morning Brief," "End of Day Recap"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Custom summary lengths and tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Transcripts + follow-up Q&A</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <EarlyAccessForm />
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="container px-4 md:px-6 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="mt-8 text-center text-muted-foreground">Speasy Pro is coming soon—with personal newsletter sync, smarter filters, and AI-powered summaries.
        </p>
        <p className="text-center text-muted-foreground">Join the waitlist and help shape the future of Speasy.</p>
      </motion.div>
    </section>
  )
}
