"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ExclusionsStepProps {
  onSubmit: (exclusions: string) => void
}

export default function ExclusionsStep({ onSubmit }: ExclusionsStepProps) {
  const [exclusions, setExclusions] = useState("")

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Anything you don't want to hear?</h1>
        <p className="text-gray-500">Let us know if there are topics you'd prefer to avoid</p>
      </div>

      <Textarea
        placeholder="e.g. 'No crypto', 'Avoid politics'"
        value={exclusions}
        onChange={(e) => setExclusions(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="space-y-2">
        <Button onClick={() => onSubmit(exclusions)} className="w-full">
          Continue
        </Button>
        <Button variant="ghost" onClick={() => onSubmit("")} className="w-full">
          Skip this step
        </Button>
      </div>
    </div>
  )
}
