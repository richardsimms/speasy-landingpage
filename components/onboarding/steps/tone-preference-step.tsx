"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface TonePreferenceStepProps {
  userId: string
  onSelect: (tone: string) => void
}

export default function TonePreferenceStep({ userId, onSelect }: TonePreferenceStepProps) {
  const [selectedTone, setSelectedTone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "fast", label: "Fast-paced" },
    { value: "calm", label: "Calm" },
  ]

  const handleContinue = async () => {
    setLoading(true)
    setError("")
    const supabase = createClientComponentClient()
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ preferred_tone: selectedTone })
      .eq("id", userId)
    setLoading(false)
    if (dbError) {
      setError("Failed to save tone preference")
      return
    }
    onSelect(selectedTone)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">What's your preferred tone?</h1>
        <p className="text-gray-500">This helps us match content to your style</p>
      </div>

      <RadioGroup value={selectedTone} onValueChange={setSelectedTone} className="space-y-4">
        {tones.map((tone) => (
          <div key={tone.value} className="flex items-center space-x-3">
            <RadioGroupItem value={tone.value} id={tone.value} />
            <Label htmlFor={tone.value} className="text-base cursor-pointer">
              {tone.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-2">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleContinue} className="w-full" disabled={!selectedTone || loading}>
          {loading ? "Saving..." : "Continue"}
        </Button>
        <Button variant="ghost" onClick={() => onSelect("")} className="w-full">
          Skip this step
        </Button>
      </div>
    </div>
  )
}
