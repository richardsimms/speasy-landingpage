import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

export const metadata = {
  title: "Speasy - Your Newsletters. Summarized. In Your Ears.",
  description: "Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries.",
  generator: 'v0.dev',
  openGraph: {
    type: 'website',
    title: 'Speasy - Your Newsletters. Summarized. In Your Ears.',
    description: 'Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries.',
    url: 'https://speasy.app/',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
