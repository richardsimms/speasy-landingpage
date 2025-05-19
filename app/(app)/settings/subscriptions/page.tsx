import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CategoryList } from "@/components/category-list"
import CancelAndDeleteActions from "@/components/CancelAndDeleteActions"

export default async function SubscriptionsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's subscribed categories
  const { data: subscriptions } = await supabase
    .from("user_category_subscriptions")
    .select("category_id")
    .eq("user_id", user.id)

  const subscribedCategoryIds = subscriptions?.map((sub) => sub.category_id) || []

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Subscriptions</h3>
        <p className="text-sm text-muted-foreground">
          You are subscribed to Speasy.
        </p>
      </div>
      <CancelAndDeleteActions />
    </div>
  )
}
