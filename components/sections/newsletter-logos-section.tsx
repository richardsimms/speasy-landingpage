"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function NewsletterLogosSection() {
  // Newsletter data with name and logo path
  const newsletters = [
    { name: "Morning Brew", logo: "/logos/morning-brew.svg" },
    { name: "Stratechery", logo: "/logos/stratechery.svg" },
  ]

  return (
    <section className="w-full py-12 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start listening to top newsletters</h2>
          <p className="mt-4 text-lg text-muted-foreground">Available on the Start listening plan</p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {newsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.name}
              className="flex items-center grayscale hover:grayscale-0 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="h-8 md:h-10 relative flex items-center">
                <Image
                  src={newsletter.logo}
                  alt={`${newsletter.name} logo`}
                  width={120}
                  height={40}
                  className="h-full w-auto object-contain"
                /> 
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 