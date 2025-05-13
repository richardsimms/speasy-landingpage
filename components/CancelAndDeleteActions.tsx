'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle } from 'lucide-react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function CancelAndDeleteActions() {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  async function handleCancelSubscription() {
    setLoading(true)
    try {
      const res = await fetch("/api/cancel-subscription", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        alert("Subscription canceled.")
      } else {
        alert(data.error || "Failed to cancel subscription.")
      }
    } catch (e) {
      alert("Error canceling subscription.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch("/api/delete-account", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Thank you!",
          description: "Your account has been closed. We appreciate your time with us.",
        })
        
        // Sign out the user client-side before redirecting
        await supabase.auth.signOut()
        
        // Redirect to home page
        window.location.href = "/"
      } else {
        alert(data.error || "Failed to delete account.")
      }
    } catch (e) {
      alert("Error deleting account.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="w-full max-w-full mx-auto mt-12">
      <div className="border border-red-700 bg-background rounded-xl p-8 w-full shadow-lg">

        <div className="text-xl font-semibold text-foreground mb-2">Delete Account</div>
        <div className="text-base text-foreground mb-6 max-w-md">
          The account will be <span className="text-red-400 font-bold">permanently deleted</span>, including all your data. <br />
          <span className="text-red-400">This action is irreversible and cannot be undone.</span>
        </div>
        <Button
          variant="destructive"
          size="lg"
          className="w-full max-w-xs text-lg font-bold rounded-md"
          onClick={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  )
}
