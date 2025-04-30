"use client"

import { useSearchParams } from "next/navigation"
import { Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")
  const errorDescription = searchParams.get("error_description")

  const getErrorMessage = () => {
    if (errorCode === "otp_expired") {
      return "Your login link has expired. This happens after 24 hours for security reasons. Please request a new link to continue."
    }
    if (error === "access_denied") {
      return "Access was denied. Please try signing in again."
    }
    return "An error occurred during sign in. Please try again."
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center gap-2">
          <Headphones className="h-6 w-6 text-primary" />
          <span className="text-2xl font-medium tracking-tight">Speasy</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Login Link Expired</h1>
        <p className="text-sm text-muted-foreground">{getErrorMessage()}</p>
      </div>

      <div className="space-y-4">
        <Link href="/auth/login">
          <Button className="w-full">
            Request New Login Link
          </Button>
        </Link>
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Suspense 
        fallback={
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading...</span>
            </div>
          </div>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  )
} 