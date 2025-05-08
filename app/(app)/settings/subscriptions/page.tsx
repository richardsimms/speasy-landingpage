'use client'

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CategoryList } from "@/components/category-list"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default async function SubscriptionsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get user's subscribed categories
  const { data: subscriptions } = await supabase
    .from("user_category_subscriptions")
    .select("category_id")
    .eq("user_id", session.user.id)

  const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || []

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Newsletter Subscriptions</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to categories to receive audio content from these sources.
        </p>
      </div>

      <CategoryList categories={categories || []} subscribedIds={subscribedCategoryIds} />
      <CancelAndDeleteActions />
    </div>
  )
}

function CancelAndDeleteActions() {
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
    <div className="space-y-2 pt-8">
      <Button variant="outline" onClick={handleCancelSubscription} disabled={loading}>
        {loading ? "Canceling..." : "Cancel Subscription"}
      </Button>
      <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
        {deleting ? "Deleting..." : "Delete Account"}
      </Button>
    </div>
  )
}
