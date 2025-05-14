"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface CategoryStepProps {
  userId: string
  onSelect: (categories: string[]) => void
}

export default function CategoryStep({ userId, onSelect }: CategoryStepProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [otherCategory, setOtherCategory] = useState("")
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("categories").select("name").order("name")
      if (data) {
        setCategories(data.map((cat: { name: string }) => cat.name))
      }
      // Optionally handle error
    })()
  }, [])

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (category === "Other") {
      setShowOtherInput(checked)
      if (!checked) {
        setOtherCategory("")
      }
      return
    }

    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, category]
      } else {
        return prev.filter((c) => c !== category)
      }
    })
  }

  const handleContinue = async () => {
    const finalCategories = [...selectedCategories]
    if (showOtherInput && otherCategory.trim()) {
      finalCategories.push(otherCategory.trim())
    }
    if (finalCategories.length === 0) {
      setError("Please select at least one category")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClientComponentClient()
    const { error: dbError } = await supabase
      .from("users")
      .update({ categoryPreferences: finalCategories })
      .eq("id", userId)
    setLoading(false)
    if (dbError) {
      setError("Failed to save categories")
      return
    }
    onSelect(finalCategories)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">What do you want to hear more about?</h1>
        <p className="text-gray-500">Select all that interest you</p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-3">
            <Checkbox
              id={category}
              checked={category === "Other" ? showOtherInput : selectedCategories.includes(category)}
              onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
            />
            <Label htmlFor={category} className="text-base cursor-pointer">
              {category}
            </Label>
          </div>
        ))}

        {showOtherInput && (
          <div className="pl-7 mt-2">
            <Input
              placeholder="What else interests you?"
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Button onClick={handleContinue} className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  )
}
