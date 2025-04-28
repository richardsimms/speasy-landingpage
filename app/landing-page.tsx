"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Headphones, Zap, Twitter, Linkedin, X, ListFilter } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { EarlyAccessForm } from "@/components/early-access-form"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="text-lg font-medium tracking-tight">Speasy</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-primary">
              Sign In
            </Link>
            <EarlyAccessForm />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-medium tracking-tight sm:text-5xl xl:text-6xl/none">
                    Your newsletters. Summarized. In your ears.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries.
                    Listen on your commute, while walking the dog, or during a coffee break.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <EarlyAccessForm />
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Check className="mr-1 h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Free plan includes curated newsletters. Paid plan adds your inbox.
                    </span>
                  </div>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center">
                <div className="relative w-full h-[400px] lg:h-[550px] rounded-lg overflow-hidden">
                  <Image
                    src="/images/speasy-mockup.png"
                    alt="Speasy app interface showing newsletter summaries on mobile and desktop"
                    width={1024}
                    height={1024}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem & Vision Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-center space-y-4">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
                  Inbox full of unread newsletters?
                  <br />
                  You're not alone.
                </h2>
                <p className="text-muted-foreground md:text-xl mt-6 text-left">
                  You signed up for Lenny's, Dense Discovery, TLDR, and a dozen more.
                  <br />
                  Every issue has golden insights—but who has the time to read them all?
                </p>
                <p className="text-muted-foreground md:text-xl mt-6 text-left">
                  Speasy gives you back control. We summarize the best of the best into audio.
                  <br />
                  And when you're ready, we'll do the same for your inbox too.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">How Speasy works</h2>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-3">
              <Card className="border bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                    <ListFilter className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4 text-xl">1. Choose your sources</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Start with a set of the top public newsletters in tech, business, productivity, and design.
                  </p>
                </CardContent>
              </Card>
              <Card className="border bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4 text-xl">2. Listen on the go</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    We deliver smart audio summaries to your private podcast feed.
                  </p>
                </CardContent>
              </Card>
              <Card className="border bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4 text-xl">3. Upgrade for personalization</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Want summaries from your inbox? Connect Gmail or Outlook and let Speasy curate your daily feed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Free vs Paid Breakdown */}
        <section id="pricing" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
                  Start free. Upgrade when you're ready to go deeper.
                </h2>
              </div>
            </div>
            <div className="mx-auto max-w-4xl py-12">
              <div className="overflow-hidden rounded-lg border shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-medium">Feature</th>
                      <th className="px-6 py-4 text-center font-medium">Free Plan</th>
                      <th className="px-6 py-4 text-center font-medium">Pro Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Curated newsletter summaries</td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Private podcast feed</td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Categories (e.g. Tech, Design, Growth)</td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Inbox newsletter summaries</td>
                      <td className="px-6 py-4 text-center">
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Personalized filters & tags</td>
                      <td className="px-6 py-4 text-center">
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Daily briefing format</td>
                      <td className="px-6 py-4 text-center">
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Transcript + content archive</td>
                      <td className="px-6 py-4 text-center">
                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-primary" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-center">
                <EarlyAccessForm />
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="w-full py-20 md:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
                  Built for the curious. Loved by the busy.
                </h2>
              </div>
            </div>
            <div className="mx-auto grid max-w-3xl gap-6 py-12 md:grid-cols-2">
              <div className="flex items-center space-x-3 p-4 rounded-lg border bg-card/50">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Founders who never read but want to learn</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border bg-card/50">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Designers who multitask while staying sharp</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border bg-card/50">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Creators and execs drowning in subscriptions</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border bg-card/50">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Knowledge workers who listen more than they scroll</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Speasy Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-center space-y-4">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
                  Not another inbox tool.
                  <br />A time machine for your brain.
                </h2>
                <p className="text-muted-foreground md:text-xl mt-6 text-left">
                  Forget the guilt of unread newsletters.
                  <br />
                  Forget skimming 10 emails to find one good idea.
                  <br />
                  Forget letting great content go to waste.
                </p>
                <p className="text-muted-foreground md:text-xl mt-6 text-left">
                  Speasy is the easiest way to stay informed—hands-free, eyes-free, stress-free.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-20 md:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">What our users say</h2>
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 py-12 md:grid-cols-2">
              <Card className="border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <blockquote className="text-left text-xl text-muted-foreground">
                    "I used to delete most of my newsletters. Now I listen to them while walking my dog."
                  </blockquote>
                  <div className="mt-6">
                    <p className="font-medium">— Early Speasy User</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <blockquote className="text-left text-xl text-muted-foreground">
                    "The upgrade to having my own inbox curated was an instant buy."
                  </blockquote>
                  <div className="mt-6">
                    <p className="font-medium">— Busy Product Manager</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-20 md:py-32 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">Stop skimming. Start listening.</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl text-left">
                  You'll start with curated summaries. Want your own inbox audio feed? That's next.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                <EarlyAccessForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium tracking-tight">Speasy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries. Listen
                on your commute, while walking the dog, or during a coffee break.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="https://www.linkedin.com/company/speasytts/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-tight">Product</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-tight">Company</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-tight">Legal</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Speasy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
