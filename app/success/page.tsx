"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function sendLoginLink() {
      if (!email) {
        setStatus('error')
        setMessage('No email provided. Please contact support.')
        return
      }

      try {
        const supabase = createClientComponentClient()
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })

        if (error) {
          throw error
        }

        setStatus('success')
        setMessage('Check your email for a login link.')
      } catch (error) {
        console.error('Error sending magic link:', error)
        setStatus('error')
        setMessage('Error sending login link. Please try again or contact support.')
      }
    }

    if (email) {
      sendLoginLink()
    } else {
      setStatus('error')
      setMessage('No email provided. Please contact support.')
    }
  }, [email])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Thank you!</h1>
          <p className="mt-4 text-muted-foreground">Your subscription has been processed.</p>
        </div>

        <div className="mt-8 space-y-4 text-center">
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p>Sending login link...</p>
            </div>
          )}
          {status === 'success' && (
            <>
              <div className="rounded-md bg-primary/10 p-4 text-primary">
                <p>{message}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                A magic login link has been sent to your email. Click the link to access your account.
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <p>{message}</p>
              </div>
              <div className="mt-4">
                <Link href="/signin">
                  <Button variant="outline">Sign In Manually</Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 