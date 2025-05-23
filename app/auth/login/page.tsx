"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // const allowedDomains = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS?.split(',') || ['speasy.app'];

    // // Validate email domain
    // const emailDomain = email.split('@')[1];
    // if (!allowedDomains.includes(emailDomain)) {
    //   setMessage({
    //     type: "error",
    //     text: `Please use an approved email domain to login`,
    //   })
    //   setLoading(false)
    //   return
    // }

    try {
      const supabase = createClient()
      
      // Email exists, proceed with sending magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "An error occurred during login. Please try again.",
        })
        setLoading(false)
        return
      }

      setMessage({
        type: "success",
        text: "Check your email for the magic link! After clicking the link, you'll be automatically redirected to your dashboard. If you're not redirected, please contact support.",
      })
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage({
        type: "error",
        text: error.message || "An error occurred during login. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" />
            <span className="text-2xl font-medium tracking-tight">Speasy</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your email to receive a magic link to sign in</p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@speasy.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  <span>Sending link...</span>
                </div>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}