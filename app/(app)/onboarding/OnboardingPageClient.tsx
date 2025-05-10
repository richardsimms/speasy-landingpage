"use client";
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

function StepCategory({ value, onChange, otherValue, setOtherValue }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [otherChecked, setOtherChecked] = useState(!!otherValue);
  useEffect(() => {
    (async () => {
      const { createClientComponentClient } = await import("@supabase/auth-helpers-nextjs");
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
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8 max-w-xl mx-auto">
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Step 1 of 5</div>
        <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded">
          <div className="h-2 bg-black dark:bg-white rounded" style={{ width: "20%" }} />
        </div>
      </div>
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
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-1 dark:text-white">Listening Context</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">When do you usually listen?</p>
      <fieldset>
        <div className="flex flex-col gap-5">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
              <input
                type="radio"
                name="listening_context"
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-5 h-5 accent-black dark:accent-white"
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

function Completion({ onPreview }: any) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="text-2xl font-bold">You're all set!</h2>
      <p className="text-center">We'll tune your feed based on what matters to you.</p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-full" onClick={onPreview}>Preview my feed</button>
    </div>
  );
}

export default function OnboardingPageClient() {
  const [step, setStep] = useState(0);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);
  const [listeningContext, setListeningContext] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const router = useRouter();

  // Handlers for each step
  const handleCategory = (val: string, isOther = false) => {
    if (isOther && val) {
      setCategoryPreferences(prev => prev.includes(val) ? prev : [...prev, val]);
    } else if (val) {
      setCategoryPreferences(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    }
  };

  const handleNext = async () => {
    if (step === 0 && categoryPreferences.length === 0) return; // Require at least one
    if (step === steps.length - 1) {
      setLoading(true);
      // Submit to API
      await fetch('/api/preferences', {
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
      setLoading(false);
      setComplete(true);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => (s > 0 ? s - 1 : s));

  if (complete) return <Completion onPreview={() => router.push('/')} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 min-h-[400px] flex flex-col justify-between"
          >
            {step === 0 && <StepCategory value={categoryPreferences} onChange={handleCategory} />}
            {step === 1 && <StepContext value={listeningContext} onChange={setListeningContext} />}
            {step === 2 && <StepLength value={sessionLength} onChange={setSessionLength} />}
            {step === 3 && <StepTone value={preferredTone} onChange={setPreferredTone} />}
            {step === 4 && <StepExclusions value={exclusions} onChange={setExclusions} />}
            <div className="flex justify-between mt-8">
              <button className="text-gray-500" onClick={handleBack} disabled={step === 0}>Back</button>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-full disabled:opacity-50"
                onClick={handleNext}
                disabled={loading || (step === 0 && categoryPreferences.length === 0)}
              >
                {step === steps.length - 1 ? (loading ? 'Saving...' : 'Finish') : 'Next'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 