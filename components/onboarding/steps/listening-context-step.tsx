"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ListeningContextStepProps {
  userId: string
  onSelect: (context: string) => void
}

export default function ListeningContextStep({ userId, onSelect }: ListeningContextStepProps) {
  const [selectedContext, setSelectedContext] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const contexts = [
    { value: "commute", label: "During my commute" },
    { value: "workout", label: "While working out" },
    { value: "chores", label: "While doing chores" },
    { value: "walk", label: "On a walk" },
    { value: "multitask", label: "While multitasking" },
    { value: "bedtime", label: "Before bed" },
  ]

  const handleContinue = async () => {
    setLoading(true)
    setError("")
    const supabase = createClientComponentClient()
    const { error: dbError } = await supabase
      .from("users")
      .update({ listeningContext: selectedContext })
      .eq("id", userId)
    setLoading(false)
    if (dbError) {
      setError("Failed to save listening context")
      return
    }
    onSelect(selectedContext)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">When do you usually listen?</h1>
        <p className="text-gray-500">This helps us recommend the right content</p>
      </div>

      <RadioGroup value={selectedContext} onValueChange={setSelectedContext} className="space-y-4">
        {contexts.map((context) => (
          <div key={context.value} className="flex items-center space-x-3">
            <RadioGroupItem value={context.value} id={context.value} />
            <Label htmlFor={context.value} className="text-base cursor-pointer">
              {context.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-2">
        <Button onClick={handleContinue} className="w-full" disabled={!selectedContext}>
          Continue
        </Button>
        <Button variant="ghost" onClick={() => onSelect("")} className="w-full">
          Skip this step
        </Button>
      </div>
    </div>
  )
}
