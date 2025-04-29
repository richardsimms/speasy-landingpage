import type React from "react"
import Link from "next/link"
import { Headphones } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { EarlyAccessForm } from "@/components/early-access-form"
import FooterSection from "@/components/sections/footer-section"
import { Logo } from "@/components/logo"
import { Analytics } from "@vercel/analytics/react"

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center" aria-label="Speasy Home">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="/#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <EarlyAccessForm />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      
      <FooterSection />
     
    </div>
  )
}
