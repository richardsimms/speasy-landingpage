"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { updateUserPreferencesAction } from "@/app/actions"
import CategoryStep from "./steps/category-step"
import ListeningContextStep from "./steps/listening-context-step"
import SessionLengthStep from "./steps/session-length-step"
import TonePreferenceStep from "./steps/tone-preference-step"
import ExclusionsStep from "./steps/exclusions-step"
import CompletionStep from "./steps/completion-step"
import ProgressBar from "./progress-bar"

interface OnboardingFlowProps {
  userId: string
}

export default function OnboardingFlow({ userId }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    categoryPreferences: [] as string[],
    listeningContext: "",
    sessionLength: "",
    preferredTone: "",
    exclusions: "",
  })

  const totalSteps = 5

  const handleCategorySelect = (categories: string[]) => {
    // Update preferences state
    setPreferences((prev) => ({ ...prev, categoryPreferences: categories }))

    // Use the server action to update the database
    // We don't need to await this since we're not blocking the UI
    updateUserPreferencesAction(userId, { categoryPreferences: categories })

    // Move to next step
    setCurrentStep(1)
  }

  const handleListeningContextSelect = (context: string) => {
    setPreferences((prev) => ({ ...prev, listeningContext: context }))
    setCurrentStep(2)
  }

  const handleSessionLengthSelect = (length: string) => {
    setPreferences((prev) => ({ ...prev, sessionLength: length }))
    setCurrentStep(3)
  }

  const handleTonePreferenceSelect = (tone: string) => {
    setPreferences((prev) => ({ ...prev, preferredTone: tone }))
    setCurrentStep(4)
  }

  const handleExclusionsSubmit = (exclusions: string) => {
    const updatedPreferences = {
      ...preferences,
      exclusions,
    }

    // Update all preferences in database using the server action
    updateUserPreferencesAction(userId, {
      listeningContext: updatedPreferences.listeningContext,
      sessionLength: updatedPreferences.sessionLength,
      preferredTone: updatedPreferences.preferredTone,
      exclusions,
    })

    setPreferences(updatedPreferences)
    setCurrentStep(5)
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md px-4 py-8">
      {currentStep < totalSteps && <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          {currentStep === 0 && <CategoryStep onSelect={handleCategorySelect} />}
          {currentStep === 1 && <ListeningContextStep onSelect={handleListeningContextSelect} />}
          {currentStep === 2 && <SessionLengthStep onSelect={handleSessionLengthSelect} />}
          {currentStep === 3 && <TonePreferenceStep onSelect={handleTonePreferenceSelect} />}
          {currentStep === 4 && <ExclusionsStep onSubmit={handleExclusionsSubmit} />}
          {currentStep === 5 && <CompletionStep onComplete={handleComplete} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
