"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    quote: "I finally caught up on every newsletter I've ignored for 6 months—in one walk.",
    name: "Alex Chen",
    role: "Product Designer",
    avatar: "/air-conditioner-unit.png",
  },
  {
    quote: "This turned my inbox into a podcast. I didn't know how badly I needed that.",
    name: "Sarah Johnson",
    role: "Startup Founder",
    avatar: "/stylized-initials.png",
  },
  {
    quote: "The audio quality is surprisingly good. It doesn't sound robotic at all.",
    name: "Michael Torres",
    role: "Marketing Director",
    avatar: "/abstract-geometric-mt.png",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Users Are Saying</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <blockquote className="text-xl italic">"{testimonial.quote}"</blockquote>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-xl aspect-video"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/placeholder.svg?key=zukc2"
              alt="Person listening while walking"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium">
                A designer listening on a walk
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-xl aspect-video"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <img
              src="/urban-audio-commute.png"
              alt="Person commuting with headphones"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium">
                A founder on their morning commute
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
