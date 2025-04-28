"use client"

import { motion } from "framer-motion"

export default function StorySection() {
  return (
    <section  id="testimonials" className="w-full py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Inbox overload is real. But you shouldn't have to <span className="text-primary">choose</span> between learning and living.
          </h2>

          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              You're subscribed to all the right newsletters. But you never read them. Time is short, attention is
              split, and that "save to read later" list only gets longer.
            </p>
            <p>
              Speasy fixes this by transforming reading into listening. Whether you're commuting, cooking, or walking
              the dog—your content now works with your life.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
