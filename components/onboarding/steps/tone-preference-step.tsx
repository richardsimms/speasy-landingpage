"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface TonePreferenceStepProps {
  onSelect: (tone: string) => void
}

export default function TonePreferenceStep({ onSelect }: TonePreferenceStepProps) {
  const [selectedTone, setSelectedTone] = useState("")

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "fast", label: "Fast-paced" },
    { value: "calm", label: "Calm" },
  ]

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
        <Button onClick={() => onSelect(selectedTone)} className="w-full" disabled={!selectedTone}>
          Continue
        </Button>
        <Button variant="ghost" onClick={() => onSelect("")} className="w-full">
          Skip this step
        </Button>
      </div>
    </div>
  )
}
