"use client"

import { motion } from "framer-motion"
import { Shield, Cpu, Mail, Rss } from "lucide-react"

export default function TechStackSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-background border-t">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built with cutting-edge technology</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-4 max-w-4xl mx-auto">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Cpu className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Advanced AI</h3>
            <p className="text-sm text-muted-foreground">
              State-of-the-art text-to-speech models for natural-sounding audio
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email Integration</h3>
            <p className="text-sm text-muted-foreground">Secure Gmail and Outlook connections with OAuth</p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">End-to-end encryption and secure data handling</p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Rss className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Private Podcast</h3>
            <p className="text-sm text-muted-foreground">Personal RSS feeds compatible with all podcast apps</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
