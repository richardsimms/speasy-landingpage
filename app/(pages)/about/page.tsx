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
        title="Reclaim your time. Rewrite your story."
        description="At Speasy, we believe knowledge should move with you — not weigh you down. We're building a world where staying informed fits into your life, not around it."
      />
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Our story</h2>
              <p className="text-muted-foreground">
              Speasy was born from a simple frustration:
              Busy professionals — like you — have more to read than ever. Industry reports, thought leadership pieces, newsletters you saved for "later"... but later never comes.
              </p>
              <p className="text-muted-foreground">
              Caught between work, family, and the endless scroll, we realized it wasn’t the content that was the problem — it was the format. Reading demands time. Attention. A screen. But listening? Listening fits into life's margins.
              </p>
              <p className="text-muted-foreground">
                That's why we created Speasy: a simple, personal way to turn your saved articles into podcasts you can listen to anytime, anywhere. No guilt. No unread tabs. Just effortless learning, growth, and reclaiming your time.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Our mission</h2>
              <p className="text-muted-foreground">
              We help busy professionals and lifelong learners stay informed without falling behind.
              </p>
              <ul className="list-none space-y-2">
                <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">🚀</span>
                  <p className="text-muted-foreground">
                   We transform your saved articles into high-quality audio you can listen to on the go.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">🚀</span>
                  <p className="text-muted-foreground">
                  We empower you to optimize your time without sacrificing your goals.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">🚀</span>
                  <p className="text-muted-foreground">
                  We respect your attention, privacy, and pace of life.
                  </p>
                </li>
              </ul>
              <p className="text-muted-foreground">
                Because staying informed shouldn't feel like another job.
                It should feel like an advantage.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Who Speasy is For</h2>
              <ul className="list-none space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-muted-foreground">
                    Busy professionals (25–45) who crave continuous learning
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-muted-foreground">
                    Entrepreneurs, knowledge workers, lifelong learners
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-muted-foreground">
                    Podcast fans, productivity hackers, ambitious optimizers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span className="text-muted-foreground">
                    Anyone who wants to turn downtime into learning time
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                If you value growth, efficiency, and self-improvement — Speasy was built for you.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Why Speasy?</h2>
              <p className="text-muted-foreground">
                You asked — and we listened.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg">🔹</span>
                  <div>
                    <span className="font-semibold">Will this actually save me time?</span>
                    <br />
                    <span className="text-muted-foreground">
                      Yes. No more screen time guilt. Just seamless audio that fits into your day.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg">🔹</span>
                  <div>
                    <span className="font-semibold">Will the audio quality be good?</span>
                    <br />
                    <span className="text-muted-foreground">
                      Absolutely. We use cutting-edge text-to-speech models to deliver natural, enjoyable listening experiences​.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg">🔹</span>
                  <div>
                    <span className="font-semibold">Is it easy to use?</span>
                    <br />
                    <span className="text-muted-foreground">
                      Incredibly. Just save an article and it shows up in your podcast feed. No complicated steps​​.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg">🔹</span>
                  <div>
                    <span className="font-semibold">Is my data safe?</span>
                    <br />
                    <span className="text-muted-foreground">
                      100%. We encrypt your data and comply with global privacy standards​.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg">🔹</span>
                  <div>
                    <span className="font-semibold">Will the content stay relevant?</span>
                    <br />
                    <span className="text-muted-foreground">
                      Your feed is yours — curated by you. Not a firehose of noise​​.
                    </span>
                  </div>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/#how-it-works"
                  className="inline-block px-4 py-2 rounded-md border border-border text-foreground font-medium hover:bg-muted transition"
                >
                  Learn how it works →
                </a>
                <a
                  href="/faq"
                  className="inline-block px-4 py-2 rounded-md border border-border text-foreground font-medium hover:bg-muted transition"
                >
                  Check our FAQ →
                </a>
                <a
                  href="/#pricing"
                  className="inline-block px-4 py-2 rounded-md border border-border text-foreground font-medium hover:bg-muted transition"
                >
                  View Pricing →
                </a>
              </div>
            </div>
            <div className="space-y-4 py-8">
              <h2 className="text-2xl font-medium tracking-tight">Join the Reclaimed Time Revolution</h2>
              <p className="text-lg text-muted-foreground">
                You’re not just saving time.<br />
                You’re rewriting how you learn.<br />
                You’re reclaiming your mornings, your commutes, your walks, and turning them into catalysts for growth​​.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <a
                  href="/"
                  className="inline-block rounded-md  font-medium hover:underline transition"
                >
                  Ready to take back your day? Get started →
                </a>
                <span className="text-muted-foreground text-sm sm:ml-4">Or, stay connected:</span>
                <div className="flex gap-3">
                  <a
                    href="https://www.linkedin.com/company/speasytts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    LinkedIn
                  </a>
                  <span className="text-muted-foreground">|</span>
                  <a
                    href="/blog"
                    className="text-primary hover:underline text-sm"
                  >
                    Blog
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Our Values</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">✨</span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold">Simplicity:</span> 
                    <p>Technology should feel invisible.</p>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">✨</span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold">Respect:</span> 
                    <p>Your time, your privacy, and your focus come first.</p>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">✨</span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold">Empowerment:</span> 
                    <p>We don’t just save you time — we give it back for what matters most.</p>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-lg">✨</span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold">Growth:</span> 
                    <p>We exist to help you learn, adapt, and stay ahead — without burning out.</p>
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight">Legal &amp; Policies</h2>
              <p className="text-muted-foreground">
                Because your trust matters:
              </p>
              <div className="flex gap-3">
              <a
                    href="/privacy-policy"
                    className="text-primary hover:underline text-sm"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-muted-foreground">|</span>
                  <a
                    href="/terms-of-service"
                    className="text-primary hover:underline text-sm"
                  >
                    Terms of Service
                  </a>
                </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-medium tracking-tight flex items-center gap-2">
                Ready to listen, learn, and lead?
              </h2>
              <p className="text-muted-foreground">
                Start with Speasy today &rarr;
              </p>
              <a
                href="/"
                className="inline-block mt-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors text-center"
              >
                Get Started
              </a>
            </div>

            
          </div>
        </div>
      </section>
    </>
  )
}
