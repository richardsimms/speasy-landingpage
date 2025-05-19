import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Speasy - Your Newsletters. Summarized. In Your Ears.",
  description: "Speasy turns top-tier newsletters—and your own inbox—into short, podcast-style audio summaries.",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Hydration error helper
            window.__NEXT_HYDRATION_ERROR_INFO = window.__NEXT_HYDRATION_ERROR_INFO || {};
            window.__NEXT_HYDRATION_ERROR_INFO.timestamp = new Date().getTime();
          `
        }} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
