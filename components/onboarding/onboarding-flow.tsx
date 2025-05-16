"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import CategoryStep from "./steps/category-step"
import ListeningContextStep from "./steps/listening-context-step"
import SessionLengthStep from "./steps/session-length-step"
import TonePreferenceStep from "./steps/tone-preference-step"
import ExclusionsStep from "./steps/exclusions-step"
import CompletionStep from "./steps/completion-step"
import ProgressBar from "./progress-bar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 5

  useEffect(() => {
    // Log authentication information for debugging
    const verifyUserId = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Authentication verification error:", error);
        } else {
          console.log("Authenticated user ID:", data.user?.id);
          console.log("Passed userId prop:", userId);
          
          if (data.user?.id !== userId) {
            console.warn("User ID mismatch! This could cause issues with database operations.");
          }
        }
      } catch (err) {
        console.error("Failed to verify user authentication:", err);
      }
    };
    
    verifyUserId();
  }, [userId]);

  const handleCategorySelect = (categories: string[]) => {
    setPreferences((prev) => ({ ...prev, categoryPreferences: categories }))
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
    setPreferences((prev) => ({ ...prev, exclusions }))
    setCurrentStep(5)
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClientComponentClient();
      
      // Verify user authentication before updating
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error("Authentication error: " + (authError?.message || "User not authenticated"));
      }
      
      if (authData.user.id !== userId) {
        console.warn("User ID mismatch. Using authenticated ID instead of passed ID.");
        // Use the authenticated user ID instead of the passed one for security
        userId = authData.user.id;
      }
      
      // Update the users table with categoryPreferences
      const { error: userError } = await supabase
        .from('users')
        .update({ categoryPreferences: preferences.categoryPreferences })
        .eq('id', userId)
        
      if (userError) throw userError
      // Optionally, update other preferences here if you want
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          {error && <div className="text-red-600 text-center mb-2">{error}</div>}
          {currentStep === 0 && <CategoryStep userId={userId} onSelect={handleCategorySelect} />}
          {currentStep === 1 && <ListeningContextStep userId={userId} onSelect={handleListeningContextSelect} />}
          {currentStep === 2 && <SessionLengthStep userId={userId} onSelect={handleSessionLengthSelect} />}
          {currentStep === 3 && <TonePreferenceStep userId={userId} onSelect={handleTonePreferenceSelect} />}
          {currentStep === 4 && <ExclusionsStep userId={userId} onSubmit={handleExclusionsSubmit} />}
          {currentStep === 5 && <CompletionStep onComplete={handleComplete} loading={loading} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
