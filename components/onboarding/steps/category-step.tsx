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

interface Category {
  id: string
  name: string
}

export default function CategoryStep({ userId, onSelect }: CategoryStepProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [otherCategory, setOtherCategory] = useState("")
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    (async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("categories").select("id, name").order("name")
      if (data) {
        setCategories(data)
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
    // Prepare the rows to insert
    const rows = finalCategories.map((categoryName) => {
      const cat = categories.find(c => c.name === categoryName)
      return {
        user_id: userId,
        category_id: cat?.id || categoryName // fallback for 'Other' as custom name
      }
    })
    const { error: dbError } = await supabase
      .from("user_category_subscriptions")
      .insert(rows)
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
          <div key={category.id} className="flex items-center space-x-3">
            <Checkbox
              id={category.name}
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={(checked) => handleCategoryChange(category.name, checked as boolean)}
            />
            <Label htmlFor={category.name} className="text-base cursor-pointer">
              {category.name}
            </Label>
          </div>
        ))}
        {/* Other option 
        <div className="flex items-center space-x-3">
          <Checkbox
            id="Other"
            checked={showOtherInput}
            onCheckedChange={(checked) => handleCategoryChange("Other", checked as boolean)}
          />
          <Label htmlFor="Other" className="text-base cursor-pointer">
            Other
          </Label>
        </div>
        {showOtherInput && (
          <div className="pl-7 mt-2">
            <Input
              placeholder="What else interests you?"
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              className="w-full"
            />
          </div>
        )}*/}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Button onClick={handleContinue} className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  )
}
