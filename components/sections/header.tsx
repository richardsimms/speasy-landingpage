"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { EarlyAccessForm } from "@/components/early-access-form"
import { Logo } from "@/components/logo"

export default function Header() {
    return (
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
            <Link href="/auth/login" className="text-sm font-medium transition-colors hover:text-primary">
              Sign In
            </Link>
            <div className="hidden md:block">
              <EarlyAccessForm />
            </div>
          </div>
        </div>
    </header>
  )
}
