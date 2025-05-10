"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Category {
  id: string;
  name: string;
}

const contexts = [
  "During my commute",
  "While working out",
  "While doing chores",
  "On a walk",
  "While multitasking",
  "Before bed",
];
const lengths = ["5–10 mins","10–20","20–30","30+","It depends"];
const tones = ["Professional","Friendly","Fast","Calm"];

export default function PreferencesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState('');
  const [otherChecked, setOtherChecked] = useState(false);
  const [listeningContext, setListeningContext] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch categories from Supabase
    const fetchCategories = async () => {
      const supabase = createClientComponentClient();
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    };
    fetchCategories();

    // Fetch current preferences
    (async () => {
      setLoading(true);
      const res = await fetch('/api/preferences', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCategoryPreferences(data.categoryPreferences || []);
        setListeningContext(data.listening_context || '');
        setSessionLength(data.session_length || '');
        setPreferredTone(data.preferred_tone || '');
        setExclusions(data.exclusions || '');
        if (data.otherCategory) {
          setOtherCategory(data.otherCategory);
          setOtherChecked(true);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleCategory = (id: string) => {
    setCategoryPreferences(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryPreferences,
        otherCategory: otherChecked ? otherCategory : '',
        listening_context: listeningContext,
        session_length: sessionLength,
        preferred_tone: preferredTone,
        exclusions,
      }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-zinc-900 px-4 py-8">
      <div className="w-full max-w-xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Preferences</h2>
        {/* Category Interests */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Category Interests</label>
          <div className="flex flex-col gap-3 mt-4">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 text-lg dark:text-white">
                <input
                  type="checkbox"
                  checked={categoryPreferences.includes(cat.id)}
                  onChange={() => handleCategory(cat.id)}
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
                  if (!e.target.checked) setOtherCategory('');
                }}
                className="w-5 h-5 accent-black dark:accent-white"
              />
              Other
            </label>
            {otherChecked && (
              <input
                className="mt-1 p-2 border rounded w-full dark:bg-zinc-800 dark:text-white"
                placeholder="Type your interest"
                value={otherCategory}
                onChange={e => setOtherCategory(e.target.value)}
              />
            )}
          </div>
        </div>
        {/* Listening Context */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Listening Context</label>
          <p className="text-gray-500 dark:text-gray-400 mb-4">When do you usually listen?</p>
          <fieldset>
            <div className="flex flex-col gap-5">
              {contexts.map(opt => (
                <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
                  <input
                    type="radio"
                    name="listening_context"
                    value={opt}
                    checked={listeningContext === opt}
                    onChange={() => setListeningContext(opt)}
                    className="w-5 h-5 accent-black dark:accent-white"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {/* Session Length */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Session Length</label>
          <fieldset>
            <div className="flex flex-col gap-5 mt-4">
              {lengths.map(opt => (
                <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
                  <input
                    type="radio"
                    name="session_length"
                    value={opt}
                    checked={sessionLength === opt}
                    onChange={() => setSessionLength(opt)}
                    className="w-5 h-5 accent-black dark:accent-white"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {/* Tone Preference */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Tone Preference</label>
          <fieldset>
            <div className="flex flex-col gap-5 mt-4">
              {tones.map(opt => (
                <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
                  <input
                    type="radio"
                    name="preferred_tone"
                    value={opt}
                    checked={preferredTone === opt}
                    onChange={() => setPreferredTone(opt)}
                    className="w-5 h-5 accent-black dark:accent-white"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {/* Avoid Topics */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Avoid Topics</label>
          <input
            className="mt-2 p-2 border rounded w-full dark:bg-zinc-800 dark:text-white"
            placeholder="e.g. No crypto, Avoid politics"
            value={exclusions}
            onChange={e => setExclusions(e.target.value)}
          />
        </div>
        <button
          className="w-full mt-4 bg-black text-white dark:bg-white dark:text-black font-semibold py-3 rounded-lg disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
        {saved && <div className="text-green-600 dark:text-green-400 text-center mt-2">Preferences updated. Your feed will now reflect your changes.</div>}
      </div>
    </div>
  );
}
