"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ReloadIcon } from "@radix-ui/react-icons"

interface CategoryStepProps {
  userId: string
  onSelect: (categories: string[]) => void
}

interface Category {
  id: string
  name: string
}

// Sample categories for testing when the database fails to load
const FALLBACK_CATEGORIES = [
  { id: "1", name: "Technology" },
  { id: "2", name: "Business" },
  { id: "3", name: "Science" },
  { id: "4", name: "Design" },
  { id: "5", name: "Productivity" }
];

export default function CategoryStep({ userId, onSelect }: CategoryStepProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [otherCategory, setOtherCategory] = useState("")
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [useFallback, setUseFallback] = useState(false)
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null)

  // Verify user ID from auth
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth error in CategoryStep:", error);
          return;
        }
        
        if (data.user) {
          console.log("Verified user ID in CategoryStep:", data.user.id);
          setVerifiedUserId(data.user.id);
          
          if (data.user.id !== userId) {
            console.warn("User ID mismatch in CategoryStep! Using authenticated ID instead.");
          }
        }
      } catch (err) {
        console.error("Failed to verify user in CategoryStep:", err);
      }
    };
    
    verifyUser();
  }, [userId]);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    
    try {
      const supabase = createClientComponentClient();
      console.log("CategoryStep: Fetching categories from database");
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      
      if (error) {
        console.error("CategoryStep: Error fetching categories:", error);
        setError("Failed to load categories. Please try using the fallback or refresh.");
      }
      
      if (data && data.length > 0) {
        console.log("CategoryStep: Categories fetched successfully:", data);
        setCategories(data);
      } else {
        console.log("CategoryStep: No categories found in database");
        setError("No categories found. Please use the fallback categories to continue.");
      }
    } catch (err) {
      console.error("CategoryStep: Exception fetching categories:", err);
      setError("An unexpected error occurred. Please try the fallback categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("CategoryStep: Initializing with userId:", userId);
    fetchCategories();
  }, [userId]);

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
    
    try {
      const supabase = createClientComponentClient()
      
      // Verify the user ID again before saving
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error("Authentication error: " + authError.message);
      }
      
      // Use the verified user ID for database operations
      const actualUserId = verifiedUserId || userId;
      
      console.log("CategoryStep: Saving categories to database:", finalCategories);
      console.log("CategoryStep: Using user ID:", actualUserId);
      
      // Get all category IDs for the selected names
      const categoriesToUse = useFallback ? FALLBACK_CATEGORIES : categories;
      
      // Prepare the rows to insert
      const rows = finalCategories.map((categoryName) => {
        const cat = categoriesToUse.find(c => c.name === categoryName)
        return {
          user_id: actualUserId,
          category_id: cat?.id || categoryName // fallback for 'Other' as custom name
        }
      })
      
      console.log("CategoryStep: Inserting user_category_subscriptions:", rows);
      const { error: dbError } = await supabase
        .from("user_category_subscriptions")
        .insert(rows)
      
      if (dbError) {
        console.error("CategoryStep: Error saving categories:", dbError);
        setError("Failed to save categories: " + dbError.message)
        return
      }
      
      console.log("CategoryStep: Categories saved successfully");
      onSelect(finalCategories)
    } catch (err) {
      console.error("CategoryStep: Exception saving categories:", err);
      setError("An unexpected error occurred while saving categories")
    } finally {
      setLoading(false)
    }
  }

  const handleUseFallback = () => {
    console.log("CategoryStep: Using fallback categories");
    setCategories(FALLBACK_CATEGORIES);
    setUseFallback(true);
    setError("");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">What do you want to hear more about?</h1>
        <p className="text-gray-500">Select all that interest you</p>
      </div>

      {loading && <div className="text-center">Loading categories...</div>}
      {error && (
        <div className="p-4 border rounded-md bg-amber-50 text-amber-800">
          <p className="mb-2">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchCategories} variant="outline" size="sm">
              <ReloadIcon className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={handleUseFallback} variant="outline" size="sm">
              Use Default Categories
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.length === 0 && !loading && !error && (
          <div className="text-center text-amber-500">
            <p>No categories found. Please check your database connection.</p>
            <Button onClick={handleUseFallback} variant="outline" size="sm" className="mt-2">
              Use Default Categories
            </Button>
          </div>
        )}
        
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-3">
            <Checkbox
              id={category.id}
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={(checked) => handleCategoryChange(category.name, checked as boolean)}
            />
            <Label htmlFor={category.id} className="text-base cursor-pointer">
              {category.name}
            </Label>
          </div>
        ))}
      </div>

      <Button onClick={handleContinue} className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  )
}
