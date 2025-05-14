"use client";
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Category {
  id: string;
  name: string;
}

const steps = [
  'Category',
  'Context',
  'Length',
  'Tone',
  'Exclusions',
];

const stepPercent = [20, 40, 60, 80, 100];

function StepCategory({ value, onChange, otherValue, setOtherValue }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [otherChecked, setOtherChecked] = useState(!!otherValue);
  useEffect(() => {
    (async () => {
      const supabase = createClientComponentClient();
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    })();
  }, []);
  const handleCheckbox = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v: string) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center dark:text-white mb-1">What do you want to hear more about?</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Select all that interest you</p>
      <div className="flex flex-col gap-3">
        {categories.map(cat => (
          <label key={cat.id} className="flex items-center gap-2 text-lg dark:text-white">
            <input
              type="checkbox"
              checked={value.includes(cat.id)}
              onChange={() => handleCheckbox(cat.id)}
              className="w-5 h-5 accent-black dark:accent-white"
            />
            {cat.name}
          </label>
        ))}
        <label className="flex items-center gap-2 text-lg dark:text-white">
          <input
            type="checkbox"
            checked={otherChecked}
            onChange={e => {
              setOtherChecked(e.target.checked);
              if (!e.target.checked) setOtherValue('');
            }}
            className="w-5 h-5 accent-black dark:accent-white"
          />
          Other
        </label>
        {otherChecked && (
          <input
            className="mt-1 p-2 border rounded w-full dark:bg-zinc-800 dark:text-white"
            placeholder="Type your interest"
            value={otherValue}
            onChange={e => setOtherValue(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

function StepContext({ value, onChange }: any) {
  const options = [
    "During my commute",
    "While working out",
    "While doing chores",
    "On a walk",
    "While multitasking",
    "Before bed",
  ];
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center">When do you usually listen?</h2>
      <p className="text-center text-gray-500 mb-4">This helps us recommend the right content</p>
      <fieldset>
        <div className="flex flex-col gap-5">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-3 text-lg font-medium">
              <input
                type="radio"
                name="listening_context"
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-5 h-5 accent-black"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function StepLength({ value, onChange }: any) {
  const options = ["5–10 mins","10–20","20–30","30+","It depends"];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">What's your ideal listening length?</h2>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} className={`px-4 py-2 rounded-full border ${value === opt ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function StepTone({ value, onChange }: any) {
  const options = ["Professional","Friendly","Fast","Calm"];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">What's your preferred tone?</h2>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} className={`px-4 py-2 rounded-full border ${value === opt ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function StepExclusions({ value, onChange }: any) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Anything you don't want to hear?</h2>
      <input className="p-2 border rounded" placeholder="e.g. No crypto, Avoid politics" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export default function OnboardingPageClient() {
  const [step, setStep] = useState(0);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState('');
  const [listeningContext, setListeningContext] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch initial subscriptions on mount
  useEffect(() => {
    (async () => {
      const supabase = createClientComponentClient();
      const { data: subscriptions } = await supabase.from("user_category_subscriptions")
        .select("category_id");
      if (subscriptions) {
        setCategoryPreferences(subscriptions.map((s: any) => s.category_id));
      }
    })();
  }, []);

  // Handlers for each step
  const handleCategory = (ids: string[]) => setCategoryPreferences(ids);

  const handleNext = async () => {
    setError(null);
    if (step === 0 && categoryPreferences.length === 0 && !otherCategory) return; // Require at least one
    if (step === steps.length - 1) {
      setLoading(true);
      try {
        const supabase = createClientComponentClient();
        // Get user session for user_id
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) throw new Error('User not found');
        // 1. Save all onboarding fields to the user profile first
        const { error: profileError } = await supabase.from('profiles').update({
          category_preferences: categoryPreferences,
          other_category: otherCategory,
          listening_context: listeningContext,
          session_length: sessionLength,
          preferred_tone: preferredTone,
          exclusions,
        }).eq('id', userId);
        if (profileError) throw profileError;
        // 2. Fetch current subscriptions
        const { data: currentSubs, error: subError } = await supabase
          .from("user_category_subscriptions")
          .select("category_id")
          .eq("user_id", userId);
        if (subError) throw subError;
        const currentIds = currentSubs ? currentSubs.map((s: any) => s.category_id) : [];
        // 3. Add new subscriptions
        for (const id of categoryPreferences) {
          if (!currentIds.includes(id)) {
            const { error: insertError } = await supabase.from("user_category_subscriptions").insert({ user_id: userId, category_id: id });
            if (insertError) throw insertError;
          }
        }
        // 4. Remove unselected subscriptions
        for (const id of currentIds) {
          if (!categoryPreferences.includes(id)) {
            const { error: deleteError } = await supabase.from("user_category_subscriptions").delete().eq("user_id", userId).eq("category_id", id);
            if (deleteError) throw deleteError;
          }
        }
        // 5. Save other preferences as before (PATCH /api/preferences)
        const apiRes = await fetch('/api/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryPreferences,
            listening_context: listeningContext,
            session_length: sessionLength,
            preferred_tone: preferredTone,
            exclusions,
          }),
        });
        if (!apiRes.ok) throw new Error('Failed to update preferences');
        setLoading(false);
        setComplete(true);
      } catch (err: any) {
        setError(err.message || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => (s > 0 ? s - 1 : s));

  if (complete) return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="text-2xl font-bold">You're all set!</h2>
      <p className="text-center">We'll tune your feed based on what matters to you.</p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-full" onClick={() => { window.location.href = '/dashboard'; }}>Preview my feed</button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900 px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 min-h-[400px] flex flex-col justify-between dark:bg-zinc-900"
          >
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Step {step + 1} of 5</span>
                <span className="text-sm text-gray-500">{stepPercent[step]}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div className="h-2 bg-black rounded" style={{ width: `${stepPercent[step]}%` }} />
              </div>
            </div>
            {/* Step Content */}
            {step === 0 && <StepCategory value={categoryPreferences} onChange={handleCategory} otherValue={otherCategory} setOtherValue={setOtherCategory} />}
            {step === 1 && <StepContext value={listeningContext} onChange={setListeningContext} />}
            {step === 2 && <StepLength value={sessionLength} onChange={setSessionLength} />}
            {step === 3 && <StepTone value={preferredTone} onChange={setPreferredTone} />}
            {step === 4 && <StepExclusions value={exclusions} onChange={setExclusions} />}
            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2 mt-8">
              {error && <div className="text-red-600 text-center mb-2">{error}</div>}
              <button
                className="bg-black text-white px-6 py-2 rounded-full disabled:opacity-50 mb-2"
                onClick={handleNext}
                disabled={loading || (step === 0 && categoryPreferences.length === 0 && !otherCategory)}
              >
                {step === steps.length - 1 ? (loading ? 'Saving...' : 'Continue') : 'Continue'}
              </button>
              <button
                className="text-black text-sm underline"
                type="button"
                onClick={() => setStep(s => Math.min(s + 1, steps.length - 1))}
              >
                Skip this step
              </button>
              {step > 0 && (
                <button className="text-gray-500 text-sm mt-2" onClick={handleBack}>Back</button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 