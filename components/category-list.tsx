"use client"

import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { subscribeToCategory, unsubscribeFromCategory } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
}

interface CategoryListProps {
  categories: Category[]
  subscribedIds: string[]
}

export function CategoryList({ categories, subscribedIds }: CategoryListProps) {
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>(subscribedIds)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (categoryId: string) => {
    setIsLoading(categoryId)

    try {
      const result = await subscribeToCategory(categoryId)

      if (result.success) {
        setSubscribedCategories((prev) => [...prev, categoryId])
        toast({
          title: "Subscribed",
          description: "You have subscribed to this category.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error subscribing",
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error subscribing",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleUnsubscribe = async (categoryId: string) => {
    setIsLoading(categoryId)

    try {
      const result = await unsubscribeFromCategory(categoryId)

      if (result.success) {
        setSubscribedCategories((prev) => prev.filter((id) => id !== categoryId))
        toast({
          title: "Unsubscribed",
          description: "You have unsubscribed from this category.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error unsubscribing",
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error unsubscribing",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const isSubscribed = subscribedCategories.includes(category.id)

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="h-32 w-full rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url(${category.image_url})` }}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant={isSubscribed ? "outline" : "default"}
                className="w-full"
                onClick={() => (isSubscribed ? handleUnsubscribe(category.id) : handleSubscribe(category.id))}
                disabled={isLoading === category.id}
              >
                {isLoading === category.id ? (
                  "Processing..."
                ) : isSubscribed ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Subscribed
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Subscribe
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
