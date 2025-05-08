'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle } from 'lucide-react'

export default function CancelAndDeleteActions() {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

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
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
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
    <div className="space-y-8 pt-8">
      <div className="space-y-2">
        <Button variant="outline" onClick={handleCancelSubscription} disabled={loading}>
          {loading ? "Canceling..." : "Cancel Subscription"}
        </Button>
      </div>
      <div className="border border-red-600 bg-red-50 rounded-lg p-6 flex flex-col items-center text-center">
        <AlertTriangle className="text-red-600 mb-2" size={32} />
        <div className="font-semibold text-red-700 text-lg mb-2">Danger Zone</div>
        <div className="text-red-700 mb-4">
          <strong>Deleting your account is permanent and cannot be undone.</strong><br />
          All your data will be lost. Please proceed with caution.
        </div>
        <Button
          variant="destructive"
          size="lg"
          className="w-full max-w-xs text-lg font-bold shadow-md"
          onClick={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Account"}
        </Button>
      </div>
    </div>
  )
}
