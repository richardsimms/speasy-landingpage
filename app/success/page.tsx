"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Headphones, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/lib/supabase'

// Create a client component that uses useSearchParams
function SuccessPageClient() {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") || ""
  
  const [email, setEmail] = useState(emailFromQuery)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string, title?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // If email is provided in URL and valid, automatically try to send magic link
    if (emailFromQuery && validateEmail(emailFromQuery)) {
      handleSubscriberLogin(null, true);
    }
  }, [emailFromQuery]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubscriberLogin = async (e: React.FormEvent | null, isAuto = false) => {
    if (e) {
      e.preventDefault()
    }
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const normalizedEmail = email.toLowerCase().trim()
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setMessage({
          type: "error",
          title: "Error",
          text: error.message || "An error occurred during login. Please try again.",
        })
        setLoading(false)
        return
      }
      setMessage({
        type: "success",
        title: "Magic link sent!",
        text: "Check your email for the magic link! After clicking the link, you'll be automatically redirected to your dashboard. If you're not redirected, please contact support.",
      })
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage({
        type: "error",
        title: "Error",
        text: error.message || "An error occurred during login. Please try again."
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
          
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-xl text-center">Subscription Successful!</CardTitle>
              <CardDescription className="text-center">
                Thank you for subscribing to Speasy!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                To access your account, please enter the same email address you used during checkout.
                We'll send you a magic link to verify your email.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <form onSubmit={(e) => handleSubscriberLogin(e)} className="space-y-4">
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
              {message.title && (
                <div className="flex items-center gap-2">
                  {message.type === "error" ? 
                    <AlertCircle className="h-4 w-4" /> : 
                    <CheckCircle className="h-4 w-4" />
                  }
                  <AlertTitle>{message.title}</AlertTitle>
                </div>
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function SuccessLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" />
            <span className="text-2xl font-medium tracking-tight">Speasy</span>
          </div>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessPageClient />
    </Suspense>
  )
} 