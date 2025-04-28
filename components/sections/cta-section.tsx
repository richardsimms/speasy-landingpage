"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { EarlyAccessForm } from "@/components/early-access-form"
import { useRouter } from "next/navigation"


export default function CtaSection() {
  const router = useRouter()
  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
      <div className="container px-4 md:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Don't just read your newsletters. Live with them.
          </h2>

          <p className="text-lg text-muted-foreground">
          Join early and help us build the next version of Speasy, with inbox sync, custom playlists, and AI-powered personalization. Reclaim your reading list—One listen at a time
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              variant="default"
              type="button"
              onClick={() => {
                window.location.href = "/auth/login"
              }}
            >
              Start listening - $5/month
            </Button>
            <EarlyAccessForm />
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Available on your favorite podcast apps</p>
            <div className="flex flex-wrap gap-6 justify-center">
              <img
                src="/placeholder.svg?height=40&width=120&query=Apple Podcasts logo"
                alt="Apple Podcasts"
                className="h-10"
              />
              <img src="/placeholder.svg?height=40&width=120&query=Spotify logo" alt="Spotify" className="h-10" />
              
              <img src="/placeholder.svg?height=40&width=120&query=Overcast logo" alt="Overcast" className="h-10" />
              <img
                src="/placeholder.svg?height=40&width=120&query=Pocket Casts logo"
                alt="Pocket Casts"
                className="h-10"
              />
            </div>
          </div>

          <div className="pt-8 border-t">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-muted/50 px-4 py-2 rounded-full text-sm">
                "This is the Blinkist for newsletters but actually good."
              </div>
              <div className="bg-muted/50 px-4 py-2 rounded-full text-sm">
                "Finally, a way to consume newsletters without the guilt."
              </div>
              <div className="bg-muted/50 px-4 py-2 rounded-full text-sm">"Game changer for busy professionals."</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
