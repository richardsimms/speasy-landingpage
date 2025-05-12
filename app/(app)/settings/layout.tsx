"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <nav className="flex flex-col gap-2">
              <SettingsNavLink href="/settings/profile">Profile</SettingsNavLink>
              <SettingsNavLink href="/settings/subscriptions">Subscriptions</SettingsNavLink>
              <SettingsNavLink href="/settings/podcast">Podcast Settings</SettingsNavLink>
              <SettingsNavLink href="/settings/preferences">Preferences</SettingsNavLink>
            </nav>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

function SettingsNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Button variant={isActive ? "secondary" : "ghost"} className="justify-start" asChild>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
