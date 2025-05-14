"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ListeningContextStepProps {
  onSelect: (context: string) => void
}

export default function ListeningContextStep({ onSelect }: ListeningContextStepProps) {
  const [selectedContext, setSelectedContext] = useState("")

  const contexts = [
    { value: "commute", label: "During my commute" },
    { value: "workout", label: "While working out" },
    { value: "chores", label: "While doing chores" },
    { value: "walk", label: "On a walk" },
    { value: "multitask", label: "While multitasking" },
    { value: "bedtime", label: "Before bed" },
  ]

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
        <Button onClick={() => onSelect(selectedContext)} className="w-full" disabled={!selectedContext}>
          Continue
        </Button>
        <Button variant="ghost" onClick={() => onSelect("")} className="w-full">
          Skip this step
        </Button>
      </div>
    </div>
  )
}
