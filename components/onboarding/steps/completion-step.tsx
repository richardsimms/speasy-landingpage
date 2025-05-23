"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Loader2 } from "lucide-react"

interface CompletionStepProps {
  onComplete?: () => void
  loading?: boolean
}

export default function CompletionStep({ onComplete, loading = false }: CompletionStepProps) {
  const handleClick = () => {
    window.location.href = "/dashboard";
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-8 text-center">
      <div className="flex justify-center">
        <div className="p-3 rounded-full bg-green-100">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">You're all set!</h1>
        <p className="text-gray-500">We'll tune your feed based on what matters to you.</p>
      </div>

      <div className="space-y-3">
        <Button onClick={handleClick} className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving preferences...
            </>
          ) : (
            "Explore your personalized feed"
          )}
        </Button>
      </div>
    </div>
  )
}
