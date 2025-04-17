import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CategoryList } from "@/components/category-list"

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
    </div>
  )
}
