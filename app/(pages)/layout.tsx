import type React from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { EarlyAccessForm } from "@/components/early-access-form"
import FooterSection from "@/components/sections/footer-section"
import { Logo } from "@/components/logo"
import { Analytics } from "@vercel/analytics/react"
import Header from "@/components/sections/header"
export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header />


      <main className="flex-1">{children}</main>
      
      <FooterSection />
      <Analytics />
    </div>
  )
}
