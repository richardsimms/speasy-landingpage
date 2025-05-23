"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SessionLengthStepProps {
  userId: string
  onSelect: (length: string) => void
}

export default function SessionLengthStep({ userId, onSelect }: SessionLengthStepProps) {
  const [selectedLength, setSelectedLength] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const lengths = [
    { value: "5-10", label: "5–10 minutes" },
    { value: "10-20", label: "10–20 minutes" },
    { value: "20-30", label: "20–30 minutes" },
    { value: "30+", label: "30+ minutes" },
    { value: "varies", label: "It depends" },
  ]

  const handleContinue = async () => {
    setLoading(true)
    setError("")
    const supabase = createClientComponentClient()
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ session_length: selectedLength })
      .eq("id", userId)
    setLoading(false)
    if (dbError) {
      setError("Failed to save session length")
      return
    }
    onSelect(selectedLength)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">What's your ideal listening length?</h1>
        <p className="text-gray-500">We'll tailor content to fit your schedule</p>
      </div>

      <RadioGroup value={selectedLength} onValueChange={setSelectedLength} className="space-y-4">
        {lengths.map((length) => (
          <div key={length.value} className="flex items-center space-x-3">
            <RadioGroupItem value={length.value} id={length.value} />
            <Label htmlFor={length.value} className="text-base cursor-pointer">
              {length.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-2">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleContinue} className="w-full" disabled={!selectedLength || loading}>
          {loading ? "Saving..." : "Continue"}
        </Button>
        <Button variant="ghost" onClick={() => onSelect("")} className="w-full">
          Skip this step
        </Button>
      </div>
    </div>
  )
}
